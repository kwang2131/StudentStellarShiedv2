#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, BytesN,
    Env, MuxedAddress,
};

#[contract]
pub struct StudyBondEscrow;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum CaseStatus {
    Created,
    Funded,
    VerificationPending,
    EvidenceSubmitted,
    ReleaseApproved,
    RefundRequested,
    Disputed,
    Released,
    Refunded,
    Expired,
    Closed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StudyBondCaseRecord {
    pub case_id: BytesN<32>,
    pub student: Address,
    pub payer: Option<Address>,
    pub verifier: Address,
    pub mediator: Address,
    pub asset: Address,
    pub amount: i128,
    pub funded_amount: i128,
    pub funder: Option<Address>,
    pub status: CaseStatus,
    pub expiry_ledger: u32,
    pub latest_evidence_hash: Option<BytesN<32>>,
    pub evidence_count: u32,
    pub release_hash: Option<BytesN<32>>,
    pub refund_hash: Option<BytesN<32>>,
    pub dispute_hash: Option<BytesN<32>>,
    pub resolution_hash: Option<BytesN<32>>,
    pub resolution_student_amount: i128,
    pub resolution_verifier_amount: i128,
    pub created_at: u32,
    pub updated_at: u32,
    pub released: bool,
    pub refunded: bool,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Case(BytesN<32>),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum StudyBondError {
    AlreadyInitialized = 1,
    CaseNotFound = 2,
    InvalidAmount = 3,
    InvalidExpiry = 4,
    Unauthorized = 5,
    AlreadyFunded = 6,
    NotFunded = 7,
    InvalidStatus = 8,
    AlreadyReleased = 9,
    AlreadyRefunded = 10,
    NotDisputed = 11,
    InvalidSplit = 12,
    CaseClosed = 13,
    RefundPending = 14,
    CaseNotExpired = 15,
}

fn case_key(case_id: &BytesN<32>) -> DataKey {
    DataKey::Case(case_id.clone())
}

fn get_case_or_panic(env: &Env, case_id: &BytesN<32>) -> StudyBondCaseRecord {
    env.storage()
        .persistent()
        .get(&case_key(case_id))
        .unwrap_or_else(|| env.panic_with_error(StudyBondError::CaseNotFound))
}

fn save_case(env: &Env, case_record: &StudyBondCaseRecord) {
    env.storage()
        .persistent()
        .set(&case_key(&case_record.case_id), case_record);
}

fn token_client<'a>(env: &'a Env, asset: &'a Address) -> token::TokenClient<'a> {
    token::TokenClient::new(env, asset)
}

fn transfer_to_contract(env: &Env, asset: &Address, from: &Address, amount: i128) {
    let client = token_client(env, asset);
    let contract_address = env.current_contract_address();
    let recipient: MuxedAddress = contract_address.into();
    client.transfer(from, &recipient, &amount);
}

fn transfer_from_contract(env: &Env, asset: &Address, to: &Address, amount: i128) {
    if amount == 0 {
        return;
    }

    let client = token_client(env, asset);
    let contract_address = env.current_contract_address();
    let recipient: MuxedAddress = to.clone().into();
    client.transfer(&contract_address, &recipient, &amount);
}

fn assert_not_final(env: &Env, case_record: &StudyBondCaseRecord) {
    if matches!(
        case_record.status,
        CaseStatus::Released | CaseStatus::Refunded | CaseStatus::Closed
    ) {
        env.panic_with_error(StudyBondError::CaseClosed);
    }
}

fn assert_student(env: &Env, case_record: &StudyBondCaseRecord, actor: &Address) {
    if case_record.student != *actor {
        env.panic_with_error(StudyBondError::Unauthorized);
    }
}

fn assert_verifier(env: &Env, case_record: &StudyBondCaseRecord, actor: &Address) {
    if case_record.verifier != *actor {
        env.panic_with_error(StudyBondError::Unauthorized);
    }
}

fn assert_mediator(env: &Env, case_record: &StudyBondCaseRecord, actor: &Address) {
    if case_record.mediator != *actor {
        env.panic_with_error(StudyBondError::Unauthorized);
    }
}

fn assert_student_or_payer(env: &Env, case_record: &StudyBondCaseRecord, actor: &Address) {
    let is_payer = case_record
        .payer
        .as_ref()
        .map(|payer| payer == actor)
        .unwrap_or(false);
    if case_record.student != *actor && !is_payer {
        env.panic_with_error(StudyBondError::Unauthorized);
    }
}

fn assert_student_or_verifier(env: &Env, case_record: &StudyBondCaseRecord, actor: &Address) {
    if case_record.student != *actor && case_record.verifier != *actor {
        env.panic_with_error(StudyBondError::Unauthorized);
    }
}

fn assert_verifier_or_mediator(env: &Env, case_record: &StudyBondCaseRecord, actor: &Address) {
    if case_record.verifier != *actor && case_record.mediator != *actor {
        env.panic_with_error(StudyBondError::Unauthorized);
    }
}

fn assert_funded(env: &Env, case_record: &StudyBondCaseRecord) {
    if case_record.funded_amount != case_record.amount {
        env.panic_with_error(StudyBondError::NotFunded);
    }
}

fn assert_amount_matches(env: &Env, expected: i128, provided: i128) {
    if expected != provided || expected <= 0 {
        env.panic_with_error(StudyBondError::InvalidAmount);
    }
}

fn assert_not_released_or_refunded(env: &Env, case_record: &StudyBondCaseRecord) {
    if case_record.released {
        env.panic_with_error(StudyBondError::AlreadyReleased);
    }
    if case_record.refunded {
        env.panic_with_error(StudyBondError::AlreadyRefunded);
    }
}

fn is_expired(env: &Env, case_record: &StudyBondCaseRecord) -> bool {
    env.ledger().sequence() > case_record.expiry_ledger
}

#[contractimpl]
impl StudyBondEscrow {
    #[allow(clippy::too_many_arguments)]
    pub fn initialize_case(
        env: Env,
        case_id: BytesN<32>,
        student: Address,
        payer: Option<Address>,
        verifier: Address,
        mediator: Address,
        asset: Address,
        amount: i128,
        expiry_ledger: u32,
    ) -> StudyBondCaseRecord {
        student.require_auth();

        if env.storage().persistent().has(&case_key(&case_id)) {
            env.panic_with_error(StudyBondError::AlreadyInitialized);
        }
        if amount <= 0 {
            env.panic_with_error(StudyBondError::InvalidAmount);
        }
        if expiry_ledger <= env.ledger().sequence() {
            env.panic_with_error(StudyBondError::InvalidExpiry);
        }

        let case_record = StudyBondCaseRecord {
            case_id: case_id.clone(),
            student: student.clone(),
            payer,
            verifier,
            mediator,
            asset,
            amount,
            funded_amount: 0,
            funder: None,
            status: CaseStatus::Created,
            expiry_ledger,
            latest_evidence_hash: None,
            evidence_count: 0,
            release_hash: None,
            refund_hash: None,
            dispute_hash: None,
            resolution_hash: None,
            resolution_student_amount: 0,
            resolution_verifier_amount: 0,
            created_at: env.ledger().sequence(),
            updated_at: env.ledger().sequence(),
            released: false,
            refunded: false,
        };

        save_case(&env, &case_record);
        env.events()
            .publish((symbol_short!("init"), case_id), student);

        case_record
    }

    pub fn fund_bond(
        env: Env,
        case_id: BytesN<32>,
        funder: Address,
        amount: i128,
    ) -> StudyBondCaseRecord {
        funder.require_auth();
        let mut case_record = get_case_or_panic(&env, &case_id);
        assert_not_final(&env, &case_record);
        assert_student_or_payer(&env, &case_record, &funder);
        if case_record.funded_amount > 0 {
            env.panic_with_error(StudyBondError::AlreadyFunded);
        }
        assert_amount_matches(&env, case_record.amount, amount);

        transfer_to_contract(&env, &case_record.asset, &funder, amount);

        case_record.funder = Some(funder.clone());
        case_record.funded_amount = amount;
        case_record.status = CaseStatus::Funded;
        case_record.updated_at = env.ledger().sequence();
        save_case(&env, &case_record);

        env.events()
            .publish((symbol_short!("funded"), case_id), amount);
        case_record
    }

    pub fn submit_evidence(
        env: Env,
        case_id: BytesN<32>,
        submitter: Address,
        evidence_hash: BytesN<32>,
    ) -> StudyBondCaseRecord {
        submitter.require_auth();
        let mut case_record = get_case_or_panic(&env, &case_id);
        assert_not_final(&env, &case_record);
        assert_student(&env, &case_record, &submitter);
        if matches!(case_record.status, CaseStatus::Refunded | CaseStatus::Released) {
            env.panic_with_error(StudyBondError::InvalidStatus);
        }

        case_record.latest_evidence_hash = Some(evidence_hash.clone());
        case_record.evidence_count += 1;
        case_record.status = CaseStatus::EvidenceSubmitted;
        case_record.updated_at = env.ledger().sequence();
        save_case(&env, &case_record);

        env.events()
            .publish((symbol_short!("evidence"), case_id), evidence_hash);
        case_record
    }

    pub fn approve_release(
        env: Env,
        case_id: BytesN<32>,
        approver: Address,
        release_hash: BytesN<32>,
    ) -> StudyBondCaseRecord {
        approver.require_auth();
        let mut case_record = get_case_or_panic(&env, &case_id);
        assert_not_final(&env, &case_record);
        assert_verifier(&env, &case_record, &approver);
        assert_funded(&env, &case_record);
        assert_not_released_or_refunded(&env, &case_record);
        if matches!(
            case_record.status,
            CaseStatus::RefundRequested | CaseStatus::Disputed | CaseStatus::Expired
        ) {
            env.panic_with_error(StudyBondError::RefundPending);
        }

        transfer_from_contract(&env, &case_record.asset, &case_record.verifier, case_record.amount);

        case_record.release_hash = Some(release_hash.clone());
        case_record.status = CaseStatus::Released;
        case_record.released = true;
        case_record.updated_at = env.ledger().sequence();
        save_case(&env, &case_record);

        env.events()
            .publish((symbol_short!("release"), case_id), release_hash);
        case_record
    }

    pub fn request_refund(
        env: Env,
        case_id: BytesN<32>,
        requester: Address,
        refund_reason_hash: BytesN<32>,
    ) -> StudyBondCaseRecord {
        requester.require_auth();
        let mut case_record = get_case_or_panic(&env, &case_id);
        assert_not_final(&env, &case_record);
        assert_student(&env, &case_record, &requester);
        assert_funded(&env, &case_record);
        if case_record.released {
            env.panic_with_error(StudyBondError::AlreadyReleased);
        }

        case_record.refund_hash = Some(refund_reason_hash.clone());
        case_record.status = CaseStatus::RefundRequested;
        case_record.updated_at = env.ledger().sequence();
        save_case(&env, &case_record);

        env.events()
            .publish((symbol_short!("refundrq"), case_id), refund_reason_hash);
        case_record
    }

    pub fn approve_refund(
        env: Env,
        case_id: BytesN<32>,
        approver: Address,
        refund_hash: BytesN<32>,
    ) -> StudyBondCaseRecord {
        approver.require_auth();
        let mut case_record = get_case_or_panic(&env, &case_id);
        assert_not_final(&env, &case_record);
        assert_verifier_or_mediator(&env, &case_record, &approver);
        assert_funded(&env, &case_record);
        if case_record.released {
            env.panic_with_error(StudyBondError::AlreadyReleased);
        }
        if !matches!(case_record.status, CaseStatus::RefundRequested | CaseStatus::Expired) {
            env.panic_with_error(StudyBondError::InvalidStatus);
        }

        let refund_recipient = case_record
            .payer
            .clone()
            .unwrap_or_else(|| case_record.student.clone());
        transfer_from_contract(&env, &case_record.asset, &refund_recipient, case_record.amount);

        case_record.refund_hash = Some(refund_hash.clone());
        case_record.status = CaseStatus::Refunded;
        case_record.refunded = true;
        case_record.updated_at = env.ledger().sequence();
        save_case(&env, &case_record);

        env.events()
            .publish((symbol_short!("refund"), case_id), refund_hash);
        case_record
    }

    pub fn open_dispute(
        env: Env,
        case_id: BytesN<32>,
        opener: Address,
        dispute_hash: BytesN<32>,
    ) -> StudyBondCaseRecord {
        opener.require_auth();
        let mut case_record = get_case_or_panic(&env, &case_id);
        assert_not_final(&env, &case_record);
        assert_student_or_verifier(&env, &case_record, &opener);
        assert_funded(&env, &case_record);
        if case_record.released || case_record.refunded {
            env.panic_with_error(StudyBondError::InvalidStatus);
        }

        case_record.dispute_hash = Some(dispute_hash.clone());
        case_record.status = CaseStatus::Disputed;
        case_record.updated_at = env.ledger().sequence();
        save_case(&env, &case_record);

        env.events()
            .publish((symbol_short!("dispute"), case_id), dispute_hash);
        case_record
    }

    pub fn resolve_dispute(
        env: Env,
        case_id: BytesN<32>,
        mediator_actor: Address,
        student_amount: i128,
        verifier_amount: i128,
        resolution_hash: BytesN<32>,
    ) -> StudyBondCaseRecord {
        mediator_actor.require_auth();
        let mut case_record = get_case_or_panic(&env, &case_id);
        assert_not_final(&env, &case_record);
        assert_mediator(&env, &case_record, &mediator_actor);
        assert_funded(&env, &case_record);
        if !matches!(case_record.status, CaseStatus::Disputed | CaseStatus::Expired) {
            env.panic_with_error(StudyBondError::NotDisputed);
        }
        if student_amount < 0 || verifier_amount < 0 {
            env.panic_with_error(StudyBondError::InvalidSplit);
        }
        if student_amount + verifier_amount != case_record.amount {
            env.panic_with_error(StudyBondError::InvalidSplit);
        }

        let refund_recipient = case_record
            .payer
            .clone()
            .unwrap_or_else(|| case_record.student.clone());

        transfer_from_contract(&env, &case_record.asset, &refund_recipient, student_amount);
        transfer_from_contract(&env, &case_record.asset, &case_record.verifier, verifier_amount);

        case_record.resolution_hash = Some(resolution_hash.clone());
        case_record.resolution_student_amount = student_amount;
        case_record.resolution_verifier_amount = verifier_amount;
        case_record.released = verifier_amount > 0;
        case_record.refunded = student_amount > 0;
        case_record.status = CaseStatus::Closed;
        case_record.updated_at = env.ledger().sequence();
        save_case(&env, &case_record);

        env.events()
            .publish((symbol_short!("resolve"), case_id), resolution_hash);
        case_record
    }

    pub fn expire_case(env: Env, case_id: BytesN<32>) -> StudyBondCaseRecord {
        let mut case_record = get_case_or_panic(&env, &case_id);
        assert_not_final(&env, &case_record);
        if !is_expired(&env, &case_record) {
            env.panic_with_error(StudyBondError::CaseNotExpired);
        }

        case_record.status = CaseStatus::Expired;
        case_record.updated_at = env.ledger().sequence();
        save_case(&env, &case_record);

        env.events()
            .publish((symbol_short!("expired"), case_id), env.ledger().sequence());
        case_record
    }

    pub fn get_case(env: Env, case_id: BytesN<32>) -> StudyBondCaseRecord {
        get_case_or_panic(&env, &case_id)
    }

    pub fn get_status(env: Env, case_id: BytesN<32>) -> CaseStatus {
        get_case_or_panic(&env, &case_id).status
    }
}

#[cfg(test)]
extern crate std;

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger as _};
    use soroban_sdk::{token::StellarAssetClient, Address, BytesN, Env};
    use std::panic::{catch_unwind, AssertUnwindSafe};

    fn setup_env() -> Env {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_sequence_number(100);
        env
    }

    fn create_addresses(env: &Env) -> (Address, Address, Address, Address, Address, Address) {
        (
            Address::generate(env),
            Address::generate(env),
            Address::generate(env),
            Address::generate(env),
            Address::generate(env),
            Address::generate(env),
        )
    }

    fn create_token<'a>(env: &'a Env, admin: &'a Address) -> (Address, StellarAssetClient<'a>) {
        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        let address = sac.address();
        let admin_client = StellarAssetClient::new(env, &address);
        (address, admin_client)
    }

    fn create_case_id(env: &Env, byte: u8) -> BytesN<32> {
        BytesN::from_array(env, &[byte; 32])
    }

    fn setup_initialized_case<'a>(
        env: &'a Env,
        case_id: &'a BytesN<32>,
        amount: i128,
    ) -> (
        StudyBondEscrowClient<'a>,
        Address,
        Address,
        Address,
        Address,
        Address,
        Address,
        Address,
        Address,
    ) {
        let (student, payer, verifier, mediator, outsider, admin) = create_addresses(env);
        let (asset, asset_admin) = create_token(env, &admin);
        asset_admin.mint(&student, &amount);
        asset_admin.mint(&payer, &amount);

        let contract_address = env.register(StudyBondEscrow, ());
        let client = StudyBondEscrowClient::new(env, &contract_address);
        client.initialize_case(
            case_id,
            &student,
            &Some(payer.clone()),
            &verifier,
            &mediator,
            &asset,
            &amount,
            &150,
        );

        (
            client,
            contract_address,
            student,
            payer,
            verifier,
            mediator,
            outsider,
            admin,
            asset,
        )
    }

    fn setup_funded_case<'a>(
        env: &'a Env,
        case_id: &'a BytesN<32>,
        amount: i128,
    ) -> (
        StudyBondEscrowClient<'a>,
        Address,
        Address,
        Address,
        Address,
        Address,
        Address,
    ) {
        let (client, contract_address, student, payer, verifier, mediator, outsider, _admin, _asset) =
            setup_initialized_case(env, case_id, amount);
        client.fund_bond(case_id, &student, &amount);
        (
            client,
            student,
            payer,
            verifier,
            mediator,
            outsider,
            contract_address,
        )
    }

    fn expect_panic<F>(function: F)
    where
        F: FnOnce(),
    {
        assert!(catch_unwind(AssertUnwindSafe(function)).is_err());
    }

    #[test]
    fn initialize_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 1);
        let amount = 1_000_0000_i128;
        let (client, _contract_address, student, payer, verifier, mediator, _outsider, _admin, asset) =
            setup_initialized_case(&env, &case_id, amount);

        let case_record = client.get_case(&case_id);
        assert_eq!(case_record.student, student);
        assert_eq!(case_record.payer, Some(payer));
        assert_eq!(case_record.verifier, verifier);
        assert_eq!(case_record.mediator, mediator);
        assert_eq!(case_record.asset, asset);
        assert_eq!(case_record.status, CaseStatus::Created);
    }

    #[test]
    fn student_fund_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 2);
        let amount = 500_0000_i128;
        let (client, contract_address, student, _payer, _verifier, _mediator, _outsider, _admin, asset) =
            setup_initialized_case(&env, &case_id, amount);

        let asset_client = token::TokenClient::new(&env, &asset);
        client.fund_bond(&case_id, &student, &amount);

        assert_eq!(client.get_status(&case_id), CaseStatus::Funded);
        assert_eq!(asset_client.balance(&contract_address), amount);
    }

    #[test]
    fn payer_fund_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 3);
        let amount = 500_0000_i128;
        let (client, contract_address, _student, payer, _verifier, _mediator, _outsider, _admin, asset) =
            setup_initialized_case(&env, &case_id, amount);

        let asset_client = token::TokenClient::new(&env, &asset);
        client.fund_bond(&case_id, &payer, &amount);

        assert_eq!(client.get_status(&case_id), CaseStatus::Funded);
        assert_eq!(asset_client.balance(&contract_address), amount);
    }

    #[test]
    fn wrong_payer_fund_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 4);
        let amount = 500_0000_i128;
        let (client, _contract_address, _student, _payer, _verifier, _mediator, outsider, _admin, _asset) =
            setup_initialized_case(&env, &case_id, amount);

        expect_panic(|| {
            client.fund_bond(&case_id, &outsider, &amount);
        });
    }

    #[test]
    fn fund_wrong_amount_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 5);
        let amount = 500_0000_i128;
        let (client, _contract_address, student, _payer, _verifier, _mediator, _outsider, _admin, _asset) =
            setup_initialized_case(&env, &case_id, amount);

        expect_panic(|| {
            client.fund_bond(&case_id, &student, &(amount - 1));
        });
    }

    #[test]
    fn submit_evidence_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 6);
        let amount = 500_0000_i128;
        let (client, student, _payer, _verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);

        let evidence_hash = create_case_id(&env, 60);
        client.submit_evidence(&case_id, &student, &evidence_hash);
        let case_record = client.get_case(&case_id);
        assert_eq!(case_record.status, CaseStatus::EvidenceSubmitted);
        assert_eq!(case_record.evidence_count, 1);
    }

    #[test]
    fn non_student_evidence_submit_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 7);
        let amount = 500_0000_i128;
        let (client, _student, _payer, verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);

        let evidence_hash = create_case_id(&env, 70);
        expect_panic(|| {
            client.submit_evidence(&case_id, &verifier, &evidence_hash);
        });
    }

    #[test]
    fn verifier_approve_release_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 8);
        let amount = 500_0000_i128;
        let (client, _student, _payer, verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let release_hash = create_case_id(&env, 80);

        client.approve_release(&case_id, &verifier, &release_hash);

        assert_eq!(client.get_status(&case_id), CaseStatus::Released);
    }

    #[test]
    fn non_verifier_approve_release_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 9);
        let amount = 500_0000_i128;
        let (client, student, _payer, _verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let release_hash = create_case_id(&env, 90);

        expect_panic(|| {
            client.approve_release(&case_id, &student, &release_hash);
        });
    }

    #[test]
    fn student_request_refund_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 10);
        let amount = 500_0000_i128;
        let (client, student, _payer, _verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let refund_hash = create_case_id(&env, 100);

        client.request_refund(&case_id, &student, &refund_hash);
        assert_eq!(client.get_status(&case_id), CaseStatus::RefundRequested);
    }

    #[test]
    fn approve_refund_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 11);
        let amount = 500_0000_i128;
        let (client, student, _payer, verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let refund_hash = create_case_id(&env, 110);

        client.request_refund(&case_id, &student, &refund_hash);
        client.approve_refund(&case_id, &verifier, &refund_hash);
        assert_eq!(client.get_status(&case_id), CaseStatus::Refunded);
    }

    #[test]
    fn open_dispute_by_student_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 12);
        let amount = 500_0000_i128;
        let (client, student, _payer, _verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 120);

        client.open_dispute(&case_id, &student, &dispute_hash);
        assert_eq!(client.get_status(&case_id), CaseStatus::Disputed);
    }

    #[test]
    fn open_dispute_by_verifier_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 13);
        let amount = 500_0000_i128;
        let (client, _student, _payer, verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 130);

        client.open_dispute(&case_id, &verifier, &dispute_hash);
        assert_eq!(client.get_status(&case_id), CaseStatus::Disputed);
    }

    #[test]
    fn non_party_open_dispute_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 14);
        let amount = 500_0000_i128;
        let (client, _student, _payer, _verifier, _mediator, outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 140);

        expect_panic(|| {
            client.open_dispute(&case_id, &outsider, &dispute_hash);
        });
    }

    #[test]
    fn non_mediator_resolve_dispute_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 15);
        let amount = 500_0000_i128;
        let (client, student, _payer, _verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 150);
        let resolution_hash = create_case_id(&env, 151);

        client.open_dispute(&case_id, &student, &dispute_hash);
        expect_panic(|| {
            client.resolve_dispute(&case_id, &student, &amount, &0, &resolution_hash);
        });
    }

    #[test]
    fn mediator_resolve_refund_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 16);
        let amount = 500_0000_i128;
        let (client, student, _payer, _verifier, mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 160);
        let resolution_hash = create_case_id(&env, 161);

        client.open_dispute(&case_id, &student, &dispute_hash);
        client.resolve_dispute(&case_id, &mediator, &amount, &0, &resolution_hash);
        let case_record = client.get_case(&case_id);
        assert_eq!(case_record.status, CaseStatus::Closed);
        assert!(case_record.refunded);
    }

    #[test]
    fn mediator_resolve_release_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 17);
        let amount = 500_0000_i128;
        let (client, student, _payer, _verifier, mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 170);
        let resolution_hash = create_case_id(&env, 171);

        client.open_dispute(&case_id, &student, &dispute_hash);
        client.resolve_dispute(&case_id, &mediator, &0, &amount, &resolution_hash);
        let case_record = client.get_case(&case_id);
        assert_eq!(case_record.status, CaseStatus::Closed);
        assert!(case_record.released);
    }

    #[test]
    fn mediator_resolve_split_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 18);
        let amount = 500_0000_i128;
        let split = 200_0000_i128;
        let (client, student, _payer, _verifier, mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 180);
        let resolution_hash = create_case_id(&env, 181);

        client.open_dispute(&case_id, &student, &dispute_hash);
        client.resolve_dispute(
            &case_id,
            &mediator,
            &split,
            &(amount - split),
            &resolution_hash,
        );
        let case_record = client.get_case(&case_id);
        assert_eq!(case_record.resolution_student_amount, split);
        assert_eq!(case_record.resolution_verifier_amount, amount - split);
    }

    #[test]
    fn split_greater_than_amount_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 19);
        let amount = 500_0000_i128;
        let (client, student, _payer, _verifier, mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 190);
        let resolution_hash = create_case_id(&env, 191);

        client.open_dispute(&case_id, &student, &dispute_hash);
        expect_panic(|| {
            client.resolve_dispute(&case_id, &mediator, &amount, &1, &resolution_hash);
        });
    }

    #[test]
    fn double_release_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 20);
        let amount = 500_0000_i128;
        let (client, _student, _payer, verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let release_hash = create_case_id(&env, 200);

        client.approve_release(&case_id, &verifier, &release_hash);
        expect_panic(|| {
            client.approve_release(&case_id, &verifier, &release_hash);
        });
    }

    #[test]
    fn double_refund_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 21);
        let amount = 500_0000_i128;
        let (client, student, _payer, verifier, _mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let refund_hash = create_case_id(&env, 210);

        client.request_refund(&case_id, &student, &refund_hash);
        client.approve_refund(&case_id, &verifier, &refund_hash);
        expect_panic(|| {
            client.approve_refund(&case_id, &verifier, &refund_hash);
        });
    }

    #[test]
    fn action_after_closed_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 22);
        let amount = 500_0000_i128;
        let split = 200_0000_i128;
        let (client, student, _payer, _verifier, mediator, _outsider, _contract) =
            setup_funded_case(&env, &case_id, amount);
        let dispute_hash = create_case_id(&env, 220);
        let resolution_hash = create_case_id(&env, 221);
        let evidence_hash = create_case_id(&env, 222);

        client.open_dispute(&case_id, &student, &dispute_hash);
        client.resolve_dispute(
            &case_id,
            &mediator,
            &split,
            &(amount - split),
            &resolution_hash,
        );
        expect_panic(|| {
            client.submit_evidence(&case_id, &student, &evidence_hash);
        });
    }

    #[test]
    fn expire_case_flow_success() {
        let env = setup_env();
        let case_id = create_case_id(&env, 23);
        let amount = 500_0000_i128;
        let (client, _contract_address, _student, _payer, _verifier, _mediator, _outsider, _admin, _asset) =
            setup_initialized_case(&env, &case_id, amount);

        env.ledger().set_sequence_number(151);
        client.expire_case(&case_id);
        assert_eq!(client.get_status(&case_id), CaseStatus::Expired);
    }

    #[test]
    fn invalid_state_transition_fail() {
        let env = setup_env();
        let case_id = create_case_id(&env, 24);
        let amount = 500_0000_i128;
        let (client, _contract_address, _student, _payer, verifier, _mediator, _outsider, _admin, _asset) =
            setup_initialized_case(&env, &case_id, amount);
        let refund_hash = create_case_id(&env, 240);

        expect_panic(|| {
            client.approve_refund(&case_id, &verifier, &refund_hash);
        });
    }
}

import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export type CaseStatus = {tag: "Created", values: void} | {tag: "Funded", values: void} | {tag: "VerificationPending", values: void} | {tag: "EvidenceSubmitted", values: void} | {tag: "ReleaseApproved", values: void} | {tag: "RefundRequested", values: void} | {tag: "Disputed", values: void} | {tag: "Released", values: void} | {tag: "Refunded", values: void} | {tag: "Expired", values: void} | {tag: "Closed", values: void};

export const StudyBondError = {
  1: {message:"AlreadyInitialized"},
  2: {message:"CaseNotFound"},
  3: {message:"InvalidAmount"},
  4: {message:"InvalidExpiry"},
  5: {message:"Unauthorized"},
  6: {message:"AlreadyFunded"},
  7: {message:"NotFunded"},
  8: {message:"InvalidStatus"},
  9: {message:"AlreadyReleased"},
  10: {message:"AlreadyRefunded"},
  11: {message:"NotDisputed"},
  12: {message:"InvalidSplit"},
  13: {message:"CaseClosed"},
  14: {message:"RefundPending"},
  15: {message:"CaseNotExpired"}
}


export interface StudyBondCaseRecord {
  amount: i128;
  asset: string;
  case_id: Buffer;
  created_at: u32;
  dispute_hash: Option<Buffer>;
  evidence_count: u32;
  expiry_ledger: u32;
  funded_amount: i128;
  funder: Option<string>;
  latest_evidence_hash: Option<Buffer>;
  mediator: string;
  payer: Option<string>;
  refund_hash: Option<Buffer>;
  refunded: boolean;
  release_hash: Option<Buffer>;
  released: boolean;
  resolution_hash: Option<Buffer>;
  resolution_student_amount: i128;
  resolution_verifier_amount: i128;
  status: CaseStatus;
  student: string;
  updated_at: u32;
  verifier: string;
}

export interface Client {
  /**
   * Construct and simulate a get_case transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_case: ({case_id}: {case_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a fund_bond transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  fund_bond: ({case_id, funder, amount}: {case_id: Buffer, funder: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a get_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_status: ({case_id}: {case_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<CaseStatus>>

  /**
   * Construct and simulate a expire_case transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  expire_case: ({case_id}: {case_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a open_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  open_dispute: ({case_id, opener, dispute_hash}: {case_id: Buffer, opener: string, dispute_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a approve_refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_refund: ({case_id, approver, refund_hash}: {case_id: Buffer, approver: string, refund_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a request_refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  request_refund: ({case_id, requester, refund_reason_hash}: {case_id: Buffer, requester: string, refund_reason_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a approve_release transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_release: ({case_id, approver, release_hash}: {case_id: Buffer, approver: string, release_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a initialize_case transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize_case: ({case_id, student, payer, verifier, mediator, asset, amount, expiry_ledger}: {case_id: Buffer, student: string, payer: Option<string>, verifier: string, mediator: string, asset: string, amount: i128, expiry_ledger: u32}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  resolve_dispute: ({case_id, mediator_actor, student_amount, verifier_amount, resolution_hash}: {case_id: Buffer, mediator_actor: string, student_amount: i128, verifier_amount: i128, resolution_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

  /**
   * Construct and simulate a submit_evidence transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_evidence: ({case_id, submitter, evidence_hash}: {case_id: Buffer, submitter: string, evidence_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<StudyBondCaseRecord>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAACkNhc2VTdGF0dXMAAAAAAAsAAAAAAAAAAAAAAAdDcmVhdGVkAAAAAAAAAAAAAAAABkZ1bmRlZAAAAAAAAAAAAAAAAAATVmVyaWZpY2F0aW9uUGVuZGluZwAAAAAAAAAAAAAAABFFdmlkZW5jZVN1Ym1pdHRlZAAAAAAAAAAAAAAAAAAAD1JlbGVhc2VBcHByb3ZlZAAAAAAAAAAAAAAAAA9SZWZ1bmRSZXF1ZXN0ZWQAAAAAAAAAAAAAAAAIRGlzcHV0ZWQAAAAAAAAAAAAAAAhSZWxlYXNlZAAAAAAAAAAAAAAACFJlZnVuZGVkAAAAAAAAAAAAAAAHRXhwaXJlZAAAAAAAAAAAAAAAAAZDbG9zZWQAAA==",
        "AAAABAAAAAAAAAAAAAAADlN0dWR5Qm9uZEVycm9yAAAAAAAPAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAEAAAAAAAAADENhc2VOb3RGb3VuZAAAAAIAAAAAAAAADUludmFsaWRBbW91bnQAAAAAAAADAAAAAAAAAA1JbnZhbGlkRXhwaXJ5AAAAAAAABAAAAAAAAAAMVW5hdXRob3JpemVkAAAABQAAAAAAAAANQWxyZWFkeUZ1bmRlZAAAAAAAAAYAAAAAAAAACU5vdEZ1bmRlZAAAAAAAAAcAAAAAAAAADUludmFsaWRTdGF0dXMAAAAAAAAIAAAAAAAAAA9BbHJlYWR5UmVsZWFzZWQAAAAACQAAAAAAAAAPQWxyZWFkeVJlZnVuZGVkAAAAAAoAAAAAAAAAC05vdERpc3B1dGVkAAAAAAsAAAAAAAAADEludmFsaWRTcGxpdAAAAAwAAAAAAAAACkNhc2VDbG9zZWQAAAAAAA0AAAAAAAAADVJlZnVuZFBlbmRpbmcAAAAAAAAOAAAAAAAAAA5DYXNlTm90RXhwaXJlZAAAAAAADw==",
        "AAAAAQAAAAAAAAAAAAAAE1N0dWR5Qm9uZENhc2VSZWNvcmQAAAAAFwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAAB2Nhc2VfaWQAAAAD7gAAACAAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAQAAAAAAAAADGRpc3B1dGVfaGFzaAAAA+gAAAPuAAAAIAAAAAAAAAAOZXZpZGVuY2VfY291bnQAAAAAAAQAAAAAAAAADWV4cGlyeV9sZWRnZXIAAAAAAAAEAAAAAAAAAA1mdW5kZWRfYW1vdW50AAAAAAAACwAAAAAAAAAGZnVuZGVyAAAAAAPoAAAAEwAAAAAAAAAUbGF0ZXN0X2V2aWRlbmNlX2hhc2gAAAPoAAAD7gAAACAAAAAAAAAACG1lZGlhdG9yAAAAEwAAAAAAAAAFcGF5ZXIAAAAAAAPoAAAAEwAAAAAAAAALcmVmdW5kX2hhc2gAAAAD6AAAA+4AAAAgAAAAAAAAAAhyZWZ1bmRlZAAAAAEAAAAAAAAADHJlbGVhc2VfaGFzaAAAA+gAAAPuAAAAIAAAAAAAAAAIcmVsZWFzZWQAAAABAAAAAAAAAA9yZXNvbHV0aW9uX2hhc2gAAAAD6AAAA+4AAAAgAAAAAAAAABlyZXNvbHV0aW9uX3N0dWRlbnRfYW1vdW50AAAAAAAACwAAAAAAAAAacmVzb2x1dGlvbl92ZXJpZmllcl9hbW91bnQAAAAAAAsAAAAAAAAABnN0YXR1cwAAAAAH0AAAAApDYXNlU3RhdHVzAAAAAAAAAAAAB3N0dWRlbnQAAAAAEwAAAAAAAAAKdXBkYXRlZF9hdAAAAAAABAAAAAAAAAAIdmVyaWZpZXIAAAAT",
        "AAAAAAAAAAAAAAAIZ2V0X2Nhc2UAAAABAAAAAAAAAAdjYXNlX2lkAAAAA+4AAAAgAAAAAQAAB9AAAAATU3R1ZHlCb25kQ2FzZVJlY29yZAA=",
        "AAAAAAAAAAAAAAAJZnVuZF9ib25kAAAAAAAAAwAAAAAAAAAHY2FzZV9pZAAAAAPuAAAAIAAAAAAAAAAGZnVuZGVyAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAH0AAAABNTdHVkeUJvbmRDYXNlUmVjb3JkAA==",
        "AAAAAAAAAAAAAAAKZ2V0X3N0YXR1cwAAAAAAAQAAAAAAAAAHY2FzZV9pZAAAAAPuAAAAIAAAAAEAAAfQAAAACkNhc2VTdGF0dXMAAA==",
        "AAAAAAAAAAAAAAALZXhwaXJlX2Nhc2UAAAAAAQAAAAAAAAAHY2FzZV9pZAAAAAPuAAAAIAAAAAEAAAfQAAAAE1N0dWR5Qm9uZENhc2VSZWNvcmQA",
        "AAAAAAAAAAAAAAAMb3Blbl9kaXNwdXRlAAAAAwAAAAAAAAAHY2FzZV9pZAAAAAPuAAAAIAAAAAAAAAAGb3BlbmVyAAAAAAATAAAAAAAAAAxkaXNwdXRlX2hhc2gAAAPuAAAAIAAAAAEAAAfQAAAAE1N0dWR5Qm9uZENhc2VSZWNvcmQA",
        "AAAAAAAAAAAAAAAOYXBwcm92ZV9yZWZ1bmQAAAAAAAMAAAAAAAAAB2Nhc2VfaWQAAAAD7gAAACAAAAAAAAAACGFwcHJvdmVyAAAAEwAAAAAAAAALcmVmdW5kX2hhc2gAAAAD7gAAACAAAAABAAAH0AAAABNTdHVkeUJvbmRDYXNlUmVjb3JkAA==",
        "AAAAAAAAAAAAAAAOcmVxdWVzdF9yZWZ1bmQAAAAAAAMAAAAAAAAAB2Nhc2VfaWQAAAAD7gAAACAAAAAAAAAACXJlcXVlc3RlcgAAAAAAABMAAAAAAAAAEnJlZnVuZF9yZWFzb25faGFzaAAAAAAD7gAAACAAAAABAAAH0AAAABNTdHVkeUJvbmRDYXNlUmVjb3JkAA==",
        "AAAAAAAAAAAAAAAPYXBwcm92ZV9yZWxlYXNlAAAAAAMAAAAAAAAAB2Nhc2VfaWQAAAAD7gAAACAAAAAAAAAACGFwcHJvdmVyAAAAEwAAAAAAAAAMcmVsZWFzZV9oYXNoAAAD7gAAACAAAAABAAAH0AAAABNTdHVkeUJvbmRDYXNlUmVjb3JkAA==",
        "AAAAAAAAAAAAAAAPaW5pdGlhbGl6ZV9jYXNlAAAAAAgAAAAAAAAAB2Nhc2VfaWQAAAAD7gAAACAAAAAAAAAAB3N0dWRlbnQAAAAAEwAAAAAAAAAFcGF5ZXIAAAAAAAPoAAAAEwAAAAAAAAAIdmVyaWZpZXIAAAATAAAAAAAAAAhtZWRpYXRvcgAAABMAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAA1leHBpcnlfbGVkZ2VyAAAAAAAABAAAAAEAAAfQAAAAE1N0dWR5Qm9uZENhc2VSZWNvcmQA",
        "AAAAAAAAAAAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAUAAAAAAAAAB2Nhc2VfaWQAAAAD7gAAACAAAAAAAAAADm1lZGlhdG9yX2FjdG9yAAAAAAATAAAAAAAAAA5zdHVkZW50X2Ftb3VudAAAAAAACwAAAAAAAAAPdmVyaWZpZXJfYW1vdW50AAAAAAsAAAAAAAAAD3Jlc29sdXRpb25faGFzaAAAAAPuAAAAIAAAAAEAAAfQAAAAE1N0dWR5Qm9uZENhc2VSZWNvcmQA",
        "AAAAAAAAAAAAAAAPc3VibWl0X2V2aWRlbmNlAAAAAAMAAAAAAAAAB2Nhc2VfaWQAAAAD7gAAACAAAAAAAAAACXN1Ym1pdHRlcgAAAAAAABMAAAAAAAAADWV2aWRlbmNlX2hhc2gAAAAAAAPuAAAAIAAAAAEAAAfQAAAAE1N0dWR5Qm9uZENhc2VSZWNvcmQA" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_case: this.txFromJSON<StudyBondCaseRecord>,
        fund_bond: this.txFromJSON<StudyBondCaseRecord>,
        get_status: this.txFromJSON<CaseStatus>,
        expire_case: this.txFromJSON<StudyBondCaseRecord>,
        open_dispute: this.txFromJSON<StudyBondCaseRecord>,
        approve_refund: this.txFromJSON<StudyBondCaseRecord>,
        request_refund: this.txFromJSON<StudyBondCaseRecord>,
        approve_release: this.txFromJSON<StudyBondCaseRecord>,
        initialize_case: this.txFromJSON<StudyBondCaseRecord>,
        resolve_dispute: this.txFromJSON<StudyBondCaseRecord>,
        submit_evidence: this.txFromJSON<StudyBondCaseRecord>
  }
}
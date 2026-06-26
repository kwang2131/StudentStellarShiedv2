# StudyBond

Proof-of-funds and conditional deposit rail for international students on Stellar testnet.

## Pitch

StudyBond helps students, parents, schools, dorms, agencies, and landlords coordinate deposits with a visible rulebook: funds are locked for a specific purpose, verified publicly in a safe way, and released or refunded only when the agreed condition is met.

This repository is a production-oriented MVP for the Stellar Startup Track Level 4 brief. It is built with Next.js App Router, Prisma + Neon PostgreSQL, and a Soroban escrow contract deployed on Stellar testnet.

## Demo status

- Live demo: intentionally blank for now
- Demo video: intentionally blank for now
- Network: Stellar testnet only
- Contract ID: `CBDRQOFYQBJRWLLNAEFUDTP5IWBJQOTDDQT5INKDRBNVIW2DZF62HR5N`

## Compliance disclaimer

- Testnet only
- No real money
- Not a licensed escrow service
- Not a banking service
- Not a legal proof-of-funds service
- Any mainnet or fiat rollout would require legal review, KYC/AML assessment, privacy policy work, and licensed partner evaluation

## Problem

International students regularly need to prove or reserve funds for:

- tuition deposits
- dorm reservations
- rental deposits
- visa proof-of-funds workflows

The current process is fragmented and trust-heavy:

- bank screenshots are easy to fake or become stale
- international deposits are often sent before clear conditions are agreed
- students and parents do not get a transparent refund path if visa/admission/housing outcomes change
- schools, dorms, landlords, and agencies still manage status manually across email, spreadsheets, and screenshots

## Solution

StudyBond combines:

- off-chain case management in a product UI
- on-chain Soroban escrow state on Stellar testnet
- public-safe verification pages
- auditable wallet interaction proofs
- explicit release, refund, dispute, and expiry rules

The product is intentionally narrow: cross-border money with purpose, proof, and conditional release.

## Why Stellar

- Soroban gives contract-controlled release and refund logic
- testnet transactions are fast enough for demoable product flows
- explorer links make reviewer verification straightforward
- Freighter and Rabet are both supported in the main wallet layer
- Stellar testnet accounts are easy to bootstrap for technical validation

## Why Freighter + Rabet

The MVP is required to support at least two real Stellar wallets. StudyBond implements:

- wallet selector UI for `Freighter` and `Rabet`
- shared wallet adapter layer through Stellar Wallets Kit
- availability checks and install guidance
- network mismatch handling for testnet
- rejection/error logging paths
- wallet proof persistence with provider, public key, action, tx hash, timestamp, contract address, and success/failure metadata

Technical validation scripts in this repo can also sign via Stellar CLI identities. Those CLI-signed actions are real testnet transactions and are tracked separately from browser-wallet UX testing.

## Features

- Landing page with product story, wallet support, and testnet disclaimer
- Onboarding flow with role selection and wallet connection
- Dashboard for cases, wallet proofs, activity, and metrics
- Create StudyBond case flow
- Bonds list with filters and search
- Bond detail page with role-based actions
- Public verify page at `/verify/[caseId]`
- Evidence metadata submission
- Release, refund, dispute, and resolution workflows
- Wallet proof page at `/wallet-proofs`
- Test wallet directory at `/test-wallets`
- Analytics page at `/analytics`
- Feedback collection page at `/feedback`
- Submission checklist page at `/submission`
- Soroban contract tests and frontend/business-logic tests

## User roles

- `STUDENT`
- `PARENT_GUARDIAN`
- `INSTITUTION_VERIFIER`
- `AGENCY`
- `MEDIATOR`
- `ADMIN`
- `REVIEWER`

## Product flows implemented

### A. Onboarding

- Select role
- Select Freighter or Rabet
- Connect wallet
- Show public key, network, and balance when available
- Persist onboarding data
- Track onboarding analytics

### B. Case creation

- Create a case with student, payer, verifier, mediator, target country, amount, asset, expiry, and release/refund conditions
- Persist case off-chain in PostgreSQL
- Generate deterministic on-chain case ID seed
- Add audit log and analytics event

### C. Funding

- Prepare Soroban `fund_bond`
- Sign with the acting wallet
- Submit to Stellar testnet
- Persist tx hash, provider, wallet address, and audit trail

### D. Public verification

- Public-safe verification page at `/verify/[caseId]`
- Shows amount, status, asset, verifier, expiry, contract ID, and tx hash
- Uses simulated read calls against the deployed contract when `STELLAR_SIMULATION_ACCOUNT` is configured

### E. Evidence

- Evidence metadata is stored off-chain
- Evidence hash/reference is recorded
- Evidence submission can also hit Soroban `submit_evidence`

### F. Release

- Verifier approves release
- Contract transfers locked amount to verifier
- App persists tx hash, status, wallet proof, analytics, and audit row

### G. Refund

- Student requests refund
- Verifier or mediator approves refund
- Contract returns funds to payer or student per rule

### H. Dispute

- Student or verifier opens dispute
- Mediator resolves with release, refund, or split outcome
- Resolution is persisted to both chain and database

## Route map

- `/`
- `/onboarding`
- `/dashboard`
- `/bonds`
- `/bonds/new`
- `/bonds/[id]`
- `/verify/[caseId]`
- `/wallet-proofs`
- `/test-wallets`
- `/analytics`
- `/feedback`
- `/submission`

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- Neon PostgreSQL
- Soroban Rust contract
- `@stellar/stellar-sdk`
- `@creit.tech/stellar-wallets-kit`
- Vitest + Testing Library

## Architecture overview

### Frontend and API

The app uses a single Next.js codebase with App Router pages and route handlers. There is no separate backend service.

- UI routes live in `src/app`
- API routes live in `src/app/api`
- reusable UI components live in `src/components`
- server workflows live in `src/lib/server`
- Stellar integration lives in `src/lib/stellar`

### Data and persistence

Prisma models cover:

- `User`
- `StudyBondCase`
- `EvidenceFile`
- `WalletInteraction`
- `AuditLog`
- `Feedback`
- `AnalyticsEvent`
- `TestWallet`
- `ErrorLog`
- `AppSetting`

### Wallet architecture

Wallet adapters are separated into:

- `src/lib/stellar/freighter-adapter.ts`
- `src/lib/stellar/rabet-adapter.ts`
- `src/lib/stellar/wallet-kit.ts`

`WalletProvider` in `src/components/providers/wallet-provider.tsx` handles:

- provider selection
- role persistence
- connect/disconnect
- network mismatch detection
- signature requests
- client-side analytics hooks

### Contract architecture

The Soroban contract lives in `contracts/study_bond_escrow`.

Contract methods:

- `initialize_case`
- `fund_bond`
- `submit_evidence`
- `approve_release`
- `request_refund`
- `approve_refund`
- `open_dispute`
- `resolve_dispute`
- `expire_case`
- `get_case`
- `get_status`

Auth rules implemented in contract:

- only student can initialize
- only student or payer can fund
- only student can submit evidence
- only verifier can approve release
- only student can request refund
- only verifier or mediator can approve refund
- only student or verifier can open dispute
- only mediator can resolve dispute
- final states cannot be mutated again
- dispute split must exactly match locked amount

## Smart contract deployment

- Network: `testnet`
- Contract ID: `CBDRQOFYQBJRWLLNAEFUDTP5IWBJQOTDDQT5INKDRBNVIW2DZF62HR5N`
- Deployer public key: `GCAJTVOW46RLLSOIDVXCV2KQUOC46ZWFNNJBFO3K4V72J5HWGXITQIV4`
- WASM install tx: `287a4f2b88696f2b1ebef5068b2c33490a254f0ec9b0a89c4a8ad37116787cc7`
- Contract deploy tx: `6974a0a1604d0cfbf73977ad1094fdb40973ef4e6ffb0d4fe4c9ad0735fe0f47`

Explorer links:

- Contract: `https://stellar.expert/explorer/testnet/contract/CBDRQOFYQBJRWLLNAEFUDTP5IWBJQOTDDQT5INKDRBNVIW2DZF62HR5N`
- Deployer: `https://stellar.expert/explorer/testnet/account/GCAJTVOW46RLLSOIDVXCV2KQUOC46ZWFNNJBFO3K4V72J5HWGXITQIV4`
- Deploy tx: `https://stellar.expert/explorer/testnet/tx/6974a0a1604d0cfbf73977ad1094fdb40973ef4e6ffb0d4fe4c9ad0735fe0f47`

Commands:

```bash
npm run contract:build
npm run contract:deploy:testnet
npm run contract:bindings
npm run test:contract
```

## Environment variables

Use `.env.example` as the reference.

Important values:

```bash
DATABASE_URL=...
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_STELLAR_CONTRACT_ID=CBDRQOFYQBJRWLLNAEFUDTP5IWBJQOTDDQT5INKDRBNVIW2DZF62HR5N
NEXT_PUBLIC_STELLAR_NATIVE_ASSET_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
NEXT_PUBLIC_APP_URL=http://localhost:3000
STELLAR_DEPLOYER_ALIAS=studybond-deployer
STELLAR_SIMULATION_ACCOUNT=GCAJTVOW46RLLSOIDVXCV2KQUOC46ZWFNNJBFO3K4V72J5HWGXITQIV4
```

## Local development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Run tests:

```bash
npm run typecheck
npm run lint
npm run test
```

## Database setup

Run Prisma migration:

```bash
npx prisma migrate dev --name init
```

Seed base settings and sync wallet fixtures:

```bash
npm run prisma:seed
```

## Test wallet setup

This repo creates 12 real Stellar testnet identities and only writes public data to `data/test-wallets.json`.

Create and fund wallets:

```bash
npm run wallets:create
npm run wallets:verify
```

Generate technical wallet interaction proofs:

```bash
npm run wallets:proofs
```

Manual import hint for browser-wallet testing:

```bash
stellar keys secret student-01
stellar keys secret parent-01
```

Do not commit secret keys.

### Wallet fixture labels

- `student-01`
- `student-02`
- `parent-01`
- `school-01`
- `dorm-01`
- `landlord-01`
- `agency-01`
- `verifier-01`
- `admin-01`
- `mediator-01`
- `reviewer-01`
- `reviewer-02`

The authoritative public fixture file is:

- `data/test-wallets.json`

## Wallet interaction proof result

Current technical proof status in this workspace:

- 12 successful wallet interactions
- 10 unique wallet addresses
- all interactions are real Stellar testnet txs
- proof rows are persisted in PostgreSQL and shown on `/wallet-proofs`

Generated proof flows:

### Release flow

- Case ID: `cmquln8950000mov24ft2gdws`
- `initialize_case`: `7725711458cf0f1c45c1cdd0be402324ec3d83d9c35153b86514c4dd95b9807b`
- `fund_bond`: `93c498b48e9cc3a02382307390cab5b2fb1b8f48c2cbb40ce7b8d397e948e9ff`
- `submit_evidence`: `b0632e646fdcd6d74c6fa1ac8aef4b48f07ff4e230165e04c948fc7230e82145`
- `approve_release`: `9eda966b6791ced2acc71a7fe88352b1c98eb15fab705f0c19e9719e563d7044`

### Dispute flow

- Case ID: `cmqulo2n8000hmov2zl01yb70`
- `initialize_case`: `4e8c0a7710d55488ddc309caf69b905f1c68dc3f6c9607c47ac9931e3fb67ffb`
- `fund_bond`: `e7e32fbbcbdd37817ebdc99e377cb023622ccacbf6c3955ad93791e720ff4119`
- `open_dispute`: `b2c7fd33d8163ad8360e454dd4cff938202749cdb3d5e0364de1719dfacaea3c`
- `resolve_dispute`: `f91b668fa0d0e36e272f25cd2065e322a5100e2e1cff6ba6010818e820335124`

### Refund flow

- Case ID: `cmquloxs8000wmov2vdeju0wh`
- `initialize_case`: `f2b3c86d39a0108edf900ec4f32984b4a2c4f8f5736e3cacb95c85a560a147cf`
- `fund_bond`: `8d891821f11ddfce7c295d5bc331c7bcd94d34643b6ff8b85b62be3ada5bcc82`
- `request_refund`: `a29926ccd1774aaed32af993927b5300f0ca8cb5369f9ae872046030ffcf8960`
- `approve_refund`: `70395b5a9638cf8e08346da8ccf685331f46143fa4a226d58cdabe5800c06d43`

Important distinction:

- `12` CLI/test-wallet interactions above are technical validation proof
- real user product validation still belongs in `/feedback`
- do not treat synthetic technical wallets as human user feedback

## Analytics and monitoring

Analytics is implemented with first-party database-backed events in `AnalyticsEvent`.

Tracked events include:

- page views
- onboarding start
- wallet provider selected
- wallet connected / failed
- case created
- bond funded
- evidence submitted
- verify page viewed
- release/refund/dispute lifecycle events
- feedback submitted
- submission page viewed

Monitoring is implemented with first-party error logging in `ErrorLog`.

Coverage:

- wallet errors
- API errors
- contract interaction errors
- reviewer visibility through `/analytics`

## Feedback summary

- Feedback form is implemented at `/feedback`
- Summary UI is implemented
- Current recorded real-user feedback in this workspace: `0`

This is intentionally not backfilled with fake responses.

## Screenshots

Placeholder section for final GitHub submission assets:

- product UI screenshots: pending capture
- mobile responsive screenshots: pending capture
- analytics/monitoring screenshots: pending capture

## Deployment

Preferred target:

- Vercel

Current repo status:

- deployable Next.js app
- no live public URL added yet

Typical production build flow:

```bash
npm install
npx prisma migrate deploy
npm run build
npm run start
```

## Tests run

Commands verified in this workspace:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npx prisma migrate dev --name init
npm run prisma:seed
npm run wallets:create
npm run wallets:verify
npm run wallets:proofs
npm run contract:deploy:testnet
npm run contract:bindings
```

## Known limitations

- live demo URL is still blank
- demo video is still blank
- public GitHub remote is not configured here
- commit history is below the `15+ meaningful commits` submission target in the current local state
- real user feedback has not been collected yet
- screenshot assets are not captured yet
- contract event publishing uses deprecated `env.events().publish(...)` APIs and should move to `#[contractevent]`
- Neon/pg currently warns that future SSL-mode semantics will change; `verify-full` should be considered explicitly later

## Roadmap

- add live deployment and demo video
- collect real user validation feedback
- capture submission screenshots
- improve submission page with richer asset status and evidence previews
- switch Soroban events to the modern contract event macro
- add import/export tooling for reviewer-ready submission artifacts
- validate Freighter and Rabet browser flows end-to-end on the deployed site

## Submission checklist status

Current honest status from the workspace:

- Public GitHub repository: pending
- README: complete
- 15+ meaningful commits: pending
- Live demo link: pending
- Smart contract deployed on Stellar testnet: complete
- Contract deployment address: complete
- Product UI screenshots: pending
- Mobile responsive screenshots: pending
- Analytics/monitoring screenshots: pending
- Demo video link: pending
- Proof of 10+ wallet interactions: complete
- Basic user feedback summary: pending real responses
- Tests pass: complete
- Build passes: complete


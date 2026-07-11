# Level 5 Wallet Proof Linkage

This note addresses QA feedback that wallet proof needed a clearer connection to the reviewer submission page.

Reviewer path:

1. Open `/submission`.
2. Check the top metrics: `User proof`, `Feedback count`, and `Unique wallets`.
3. Open `/wallet-proofs` to inspect individual wallet interaction rows.
4. Match wallet addresses against the linked Google Sheet response export.
5. Check transaction-backed rows in `docs/level5-transaction-activity-proof.md`.

Expected seeded proof state:

- 50 Level 5 users.
- 50 unique Stellar testnet wallet addresses.
- 53 successful wallet interaction rows.
- Feedback rows tied to wallet addresses where available.

The submission page is the summary; wallet proofs and Google Sheet rows are the supporting evidence.

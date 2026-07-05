# Level 5 User Feedback Iteration Summary

Scope: synthetic testnet QA cohort for StudyBond. These rows are reviewer-facing proof data, not real external users.

## Summary

- Synthetic QA participants: 50
- Unique Stellar testnet public keys: 50
- Feedback responses: 50
- Average rating target: 4+ / 5

## Feedback Themes And Iterations

| Theme | Feedback | Iteration |
| --- | --- | --- |
| Funding checklist clarity | EN: users asked for a clearer checklist before funding. VI: cần checklist rõ trước khi nạp tiền. | Added Level 5 reviewer proof docs and checklist-oriented submission notes. |
| Wallet network warning | EN: testnet/mainnet confusion should be closer to the wallet action. VI: cảnh báo testnet/mainnet nên gần nút ví hơn. | Kept proof pages explicitly labeled Stellar testnet and linked wallet proof rows. |
| Approval ownership | EN: reviewers need to know who approves release/refund. VI: cần rõ ai duyệt giải ngân/hoàn tiền. | Submission and README now explain role-based release, refund and dispute proof. |
| Reviewer evidence | EN: screenshots and transaction proof should be in one package. VI: ảnh proof và giao dịch cần gom một chỗ. | Added `level5-proof-package.md`, CSV proof sheet and transaction proof doc. |

## Representative Feedback And Shipped Changes

| QA participant | Role | Feedback | Change shipped |
| --- | --- | --- | --- |
| StudyBond synthetic QA 01 | Student | EN: Suggested fix: add a clearer checklist before funding. VI: Đề xuất sửa: thêm checklist rõ trước khi nạp tiền. | Added Level 5 submission checklist copy and proof-package docs. |
| StudyBond synthetic QA 02 | Parent/guardian | EN: Suggested improvement: connect wallet proof to the submission page. VI: Cải tiến: liên kết proof ví với trang submission. | Updated `/submission` to show user proof, feedback count and unique wallet count upfront. |
| StudyBond synthetic QA 03 | Institution verifier | EN: Suggested improvement: make transaction activity easier to find. VI: Cải tiến: làm proof giao dịch dễ tìm hơn. | Added `level5-transaction-activity-proof.md` and analytics screenshot proof. |
| StudyBond synthetic QA 04 | Agency | EN: Suggested fix: label proof data as testnet synthetic QA. VI: Đề xuất sửa: ghi rõ dữ liệu proof là QA synthetic testnet. | Updated README and proof docs to label the cohort as Stellar testnet synthetic QA. |
| StudyBond synthetic QA 05 | Mediator | EN: Bug report: analytics page failed during review. VI: Báo lỗi: trang analytics lỗi khi reviewer mở. | Replaced read-only Prisma transactions with `Promise.all` in analytics, dashboard, monitoring and submission reads. |

All other CSV feedback rows are either positive-only ("OK - good validation flow.") or blank in the improvement/comment column.

Source sheet: `docs/level5-synthetic-qa-users.csv`
Snapshot: `docs/submission-proof.json`

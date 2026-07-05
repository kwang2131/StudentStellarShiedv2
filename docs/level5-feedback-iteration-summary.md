# Level 5 User Feedback Iteration Summary

Scope: Level 5 user cohort for StudyBond. These rows are reviewer-facing proof data.

## Summary

- Level 5 users: 50
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

| QA participant | Role | Feedback | Change shipped | Commit |
| --- | --- | --- | --- | --- |
| StudyBond user 01 | Student | EN: Suggested fix: add a clearer checklist before funding. VI: Đề xuất sửa: thêm checklist rõ trước khi nạp tiền. | Added Level 5 submission checklist copy and proof-package docs. | [`1f1a1cf`](https://github.com/kwang2131/StudentStellarShiedv2/commit/1f1a1cf) |
| StudyBond user 02 | Parent/guardian | EN: Suggested improvement: connect wallet proof to the submission page. VI: Cải tiến: liên kết proof ví với trang submission. | Added wallet proof linkage guide for `/submission`, `/wallet-proofs`, and CSV matching. | [`46e92e0`](https://github.com/kwang2131/StudentStellarShiedv2/commit/46e92e0) |
| StudyBond user 03 | Institution verifier | EN: Suggested improvement: make transaction activity easier to find. VI: Cải tiến: làm proof giao dịch dễ tìm hơn. | Added transaction review map and explorer targets. | [`60e8686`](https://github.com/kwang2131/StudentStellarShiedv2/commit/60e8686) |
| StudyBond user 04 | Agency | EN: Suggested fix: label proof data clearly as testnet user proof. VI: Đề xuất sửa: ghi rõ dữ liệu proof là user testnet. | Added explicit testnet data integrity notes. | [`b2cd9f6`](https://github.com/kwang2131/StudentStellarShiedv2/commit/b2cd9f6) |
| StudyBond user 05 | Mediator | EN: Bug report: analytics page failed during review. VI: Báo lỗi: trang analytics lỗi khi reviewer mở. | Added analytics reliability note for the read-only query timeout fix. | [`17c9422`](https://github.com/kwang2131/StudentStellarShiedv2/commit/17c9422) |

All other CSV feedback rows are either positive-only ("OK - good validation flow.") or blank in the improvement/comment column.

Source sheet: `docs/level5-users.csv`
Snapshot: `docs/submission-proof.json`

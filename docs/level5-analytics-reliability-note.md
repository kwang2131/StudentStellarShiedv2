# Level 5 Analytics Reliability Note

This note addresses reviewer feedback that the analytics page failed during reviewer checks.

## Problem

Read-only page loaders used Prisma interactive transactions for independent queries. On a slow database connection, those transactions could time out before the page rendered.

## Fix

Read-only loaders now use `Promise.all` for independent queries:

- `src/lib/server/analytics.ts`
- `src/lib/server/dashboard.ts`
- `src/lib/server/monitoring.ts`
- `src/lib/server/submission.ts`

This keeps the pages simpler and avoids interactive transaction startup failures for data that does not require a single transactional snapshot.

## Verification

- `/analytics` returns HTTP 200.
- `docs/screenshots/analytics-activity-proof.png` shows the telemetry page with 50 wallet connects and 34 feedback submissions.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after the fix.

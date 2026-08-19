# Milestone verification gate

No milestone becomes active until the previous milestone has a passing verifier report.

```mermaid
flowchart LR
    M0[M0 · Scaffold] --> V0{Verify M0}
    V0 -->|pass| M1[M1 · Data layer]
    V0 -->|fail| F0[Fix M0 and rerun]
    M1 --> V1{Verify M1}
    V1 -->|pass| M2[M2 · Auth and registration]
    V1 -->|fail| F1[Fix M1 and rerun]
    M2 --> V2{Verify M2}
    V2 -->|pass| M3[M3 · Broadcast engine]
    V2 -->|fail| F2[Fix M2 and rerun]
    M3 --> V3{Verify M3}
    V3 -->|pass| M4[M4 · Handover confirmation]
    V3 -->|fail| F3[Fix M3 and rerun]
    M4 --> V4{Verify M4}
    V4 -->|pass| M5[M5 · Payments and history]
    V4 -->|fail| F4[Fix M4 and rerun]
```

The verifier checks required artifacts, configuration invariants, automated quality gates, dependency safety, and a production HTTP smoke test. It stops at the first failed boundary and writes its detailed evidence to the ignored `.verification/` directory.

## Commands

```sh
npm run verify:m0
npm run verify:m1
npm run verify:m2
npm run verify:m3
npm run verify:m4
npm run verify:m5
npm run verify:milestone -- M5
```

Each later milestone adds its own suite before that milestone can be marked complete. The status record below is updated only after the corresponding suite passes.

| Milestone | Gate status | Next milestone |
|---|---|---|
| M0 · Setup and scaffold | Passed · 2026-08-18 · `2f23921` | M1 unlocked |
| M1 · Data layer | Passed · 2026-08-18 · `5f22ad5` | M2 unlocked |
| M2 · Auth and registration | Passed · 2026-08-19 · `24de594` | M3 unlocked |
| M3 · Broadcast engine | Passed · 2026-08-19 · `d2c49d1` | M4 unlocked |
| M4 · Handover confirmation | Passed · 2026-08-19 · `60b234b` | M5 unlocked |
| M5 · Payments and history | Passed · 2026-08-19 | M6 unlocked |

The M4 report contains 25 passing checks: strict static gates, 62 tests, production build, live database regression, clean production dependency audit, and a live HTTP journey that proves cross-property denial before completing the resident → collector → resident record. Browser verification also completed the flow at mobile and desktop breakpoints with no horizontal overflow or framework error overlay; it caught and drove the resident refresh regression fix before the final verifier run.

The M5 report contains 29 passing checks: strict static gates, 79 tests, production build, live database regression, clean production dependency audit, and a live HTTP journey that proves Anjali’s proof pack includes the missing-collector gap and a paid receipt, then creates a new resident, records a mock UPI payment, issues a digital receipt, and denies cross-occupant receipt access.

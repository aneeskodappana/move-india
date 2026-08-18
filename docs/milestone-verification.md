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
```

The verifier checks required artifacts, configuration invariants, automated quality gates, dependency safety, and a production HTTP smoke test. It stops at the first failed boundary and writes its detailed evidence to the ignored `.verification/` directory.

## Commands

```sh
npm run verify:m0
npm run verify:milestone -- M0
```

Each later milestone adds its own suite before that milestone can be marked complete. The status record below is updated only after the corresponding suite passes.

| Milestone | Gate status | Next milestone |
|---|---|---|
| M0 · Setup and scaffold | Passed · 2026-08-18 · `2f23921` | M1 unlocked |
| M1 · Data layer | Passed · 2026-08-18 · `5f22ad5` | M2 unlocked |
| M2 · Auth and registration | Not started | M3 locked |

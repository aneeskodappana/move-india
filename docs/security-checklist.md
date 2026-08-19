# §8.5 security checklist

M6 records the concrete evidence for each required control.

| Control | Status | Evidence |
|---|---|---|
| Every API route validates input with zod before touching the database | Done | Mutation routes call `parseJson` or `parseOptionalJson`. Receipt and history routes parse their identifiers with zod. |
| Drizzle parameterized queries only | Done | Repositories use the Drizzle query builder. No raw SQL string interpolation exists in `src/`. |
| Session cookie is `httpOnly`, `secure`, `sameSite: lax` | Done | `src/lib/session-cookie.ts` applies those attributes to resident and collector cookies. |
| Mutations authorize the acting occupant, not just a login | Done | Handover, payment, and receipt services compare occupant or property ownership before writes or receipt disclosure. |
| DEV OTP is banner-labeled and cannot be mistaken for real auth | Done | Sign-up shows `DEV MODE` and “No SMS will be sent.” Collector login is labeled `DEV collector mode`. |
| `.env.example` committed, `.env` gitignored, no secrets in history | Done | `.gitignore` excludes `.env` and `.env.local`. `.env.example` contains only placeholders. |
| `npm audit` clean of high/critical production findings | Done | `npm audit --omit=dev --audit-level=high` is part of the milestone verifier. |
| Rate-limit stub on OTP/login | Done | OTP request/verify and collector login consume a fixed-window in-memory limiter. |
| No PII beyond the demo; synthetic phones only | Done | Occupant phones must match `+91-00000-XXXXX`. Seed verification rejects any other prefix. |

Live production URL: https://vandi-eight.vercel.app

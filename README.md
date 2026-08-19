# Vandi

Vandi is an independent hackathon prototype for occupant-level waste-collection schedules, two-sided handover records, and personal payment receipts. It uses synthetic demo data and does not connect to Haritha Mithram, a government system, a telecom provider, or a payment processor.

## Foundation

- Next.js App Router and strict TypeScript
- Tailwind CSS with centralized civic-utility design tokens
- Drizzle ORM with a lazily created Neon HTTP client
- Zod for request validation
- Vitest and React Testing Library
- Layer rule: route handler → service → repository → database

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and replace every placeholder before using database or auth features.
3. Run `npm run dev`.

No environment file is required to render or test the M0 foundation page.

## Quality gates

Run the complete foundation gate with:

```sh
npm run check
```

Milestones also have a promotion gate. A milestone must pass its verifier before work starts on the next one:

```sh
npm run verify:m0
npm run verify:m1
npm run verify:m5
```

See [the milestone verification flow](docs/milestone-verification.md) for the verifier contract and current gate status.

Run database commands only after configuring a synthetic development database:

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:verify:m1
```

The M1 seed is deterministic and idempotent. It contains only invented addresses, synthetic phone numbers in the `+91-00000-00000` range, independent `VN-EKM` QR identifiers, and a deliberate missing-collector record for the proof-pack demo.

## Source documents

- `vandi-idea-doc.docx` explains the problem, evidence, insight, and submission story.
- `vandi-technical-spec.md` defines scope, architecture, security rules, milestones, and demo flow.

# Vandi — submission write-up

Prepared for *Build What Moves India* · August 2026  
Live demo: https://vandi-eight.vercel.app

## Problem

Door-to-door waste collection in Kochi runs through a real Kerala government programme (Haritha Karma Sena) with an official app (Haritha Mithram) that registers households by property. In a city with heavy rental turnover, the account holder is rarely the person who needs the day-to-day information. The workaround — owner-run WhatsApp groups — structurally excludes tenants, and the resulting confusion once led to my own wrongful ₹10,000 fine, after correctly-handed-over waste was scattered by strays at an uncoordinated staging point with no record of who dropped what, when.

## Who it affects

Renters, PG residents, and flatmates across Kochi and other Kerala towns using Haritha Karma Sena — and, more broadly, the roughly 30% of urban India that rents, wherever similar property-centric collection systems (Swachh Nagar, city IoT pilots) have been deployed.

## Solution

Vandi adds an occupant-level layer on top of the existing household model: individual resident profiles, daily multi-channel broadcasts, a two-sided timestamped handover record, and a personal payment ledger.

The primary journey is Anjali, a tenant at a shared Elamkulam flat. She signs up as herself, joins the property without replacing the owner, sees today’s material and window, marks waste kept out, the collector confirms pickup on a separate session, and her history/proof pack keeps both timestamps plus her own receipts.

## What changed, and why

The first public systems for this problem registered the permanent thing — the house. That was a reasonable first step. It is the wrong unit for the person who actually puts waste out and pays the fee.

Vandi keeps the property (and a fictional QR analogue) and adds the missing occupant record: role, move-in date, and an authorization boundary so one resident cannot mark another property’s handover or open another person’s receipt. The two-sided handover log is the evidence artifact the pitch is built around. The seeded 13 August gap — Anjali marked kept out, the collector mark is missing — is the same class of hole that made a wrongful fine indefensible to fight.

## Tools used, and how coding agents contributed

The submitted prototype is a single Next.js App Router app with strict TypeScript, Tailwind, Drizzle on Neon Postgres, Zod, and Vitest. Each milestone had to pass an automated verifier before the next one started.

Planning artifacts were written first. The application itself was built milestone by milestone through coding agents:

- M0–M4 (scaffold, data layer, auth, broadcast, two-sided handover) were produced in earlier agent sessions and recorded in the commit history.
- M5–M6 (payments, proof pack, security pass, Vercel deploy) were completed in this Grok session, including the live production deploy.

The agents did not just generate screens. They were constrained to route handler → service → repository → database, and the authorization tests — especially “Anjali cannot mark Ravi’s property” and “Anjali cannot view Ravi’s receipt” — were treated as the product’s core claim, not extra coverage.

## What is functional vs. mocked

**Functional, against a live synthetic database:**

- Occupant sign-up and property join
- Today’s schedule resolved from the property’s route calendar
- Resident “kept out” and collector “collected” timestamps
- Cross-property and cross-occupant authorization denials
- Payment ledger, mock pay, and printable receipts
- History/proof pack with month filters

**Explicitly mocked, and labeled in the UI:**

- OTP is a fixed DEV MODE code. No SMS is sent.
- App / SMS / WhatsApp “delivery” is a three-channel preview of one message. Nothing is sent.
- UPI is a simulated success. No money moves. No payment processor is involved.
- Addresses, occupants, phones (`+91-00000-XXXXX`), and `VN-EKM` QR IDs are invented. Ward names are real public geography.
- There is no connection, live or otherwise, to Haritha Mithram or any government system.

## Known limitations

- Grievance filing exists in the data model; a full dispute-resolution workflow was deferred.
- Shared-flat pro-rata billing and an LSGD admin console were deferred.
- Rate limiting is an in-memory stub, not a production abuse-prevention system.
- The Vercel project was deployed from the CLI. GitHub auto-deploy is not connected.
- Real adoption still needs a partnership with LSGD / Suchitwa Mission and real telecom integration. This prototype is meant to make that conversation concrete, not to impersonate an official service.

## Live demo

https://vandi-eight.vercel.app

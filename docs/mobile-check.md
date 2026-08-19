# Mobile and throttled-connection check

M6 polish targets a 320px civic-utility phone and a slow first load.

- Resident chrome stacks identity on one row and uses a three-column nav so Today / History / Payments stay tappable without horizontal overflow.
- Headings use `break-words` and step down to `text-3xl` / `text-4xl` on small screens.
- Controls keep a 48px minimum height (`min-h-12`) for thumb targets.
- `html` uses `overflow-x: clip` and a 320px minimum width.
- Route-level `loading.tsx` files stream a lightweight skeleton so a throttled navigation still shows the destination immediately.
- Landing, sign-up, history, payments, and collector screens stay server-rendered; only the pay, print, and form controllers ship client JavaScript.

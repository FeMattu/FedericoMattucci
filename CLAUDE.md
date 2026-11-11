# Personal site — project memory

Goal: minimal, elegant personal site for Federico Mattucci (CV-style home, projects, skills,
photo portfolio, contact) with an in-site admin. Branch: `feat/site-redesign`; never touch `main`.

Read `docs/DECISIONS.md` and `.claude/memory/progress.md` at the start of every session.

## Stack (target)
Next 16 App Router, React 19, TS 5 strict, Tailwind 4, shadcn/ui (CLI only), next-intl `/[locale]`,
next-themes, Prisma 6 + PostgreSQL, Auth.js v5 (allowlist `ADMIN_EMAIL`), zod, vitest, S3+CloudFront images.

## Rules
- English code/commits/docs; user-facing text only via message files or DB translations.
- Public nav = sticky TOP bar, never a sidebar. Sidebar only under `/admin`.
- Primary color = blue via CSS variables (one-line switch). Style: whitespace, thin borders, no heavy gradients.
- DB: additive, backward-compatible migrations only; never delete data.
- Every write action: session check + zod + revalidate. No `any`. No secrets in git (`.env.local` is ignored).
- Gate per phase: lint, `tsc --noEmit`, `vitest run`, `next build`.

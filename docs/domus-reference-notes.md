# Notes from the `domus` reference (read-only, nothing copied verbatim, no secrets)

- **Layering**: `app/` (pages, actions) -> `lib/services` (authorise -> validate -> persist)
  -> `lib/db/repositories` (the only Prisma users); pure domain code in `lib/*`.
- **Naming**: kebab-case files, `@/` aliases, tests mirror `src/` under `tests/{unit,integration,e2e}`.
- **Auth**: Auth.js v5; `proxy.ts` only does an *optimistic* session-cookie redirect; the real
  check (`requireUser`) runs in every page and server action. Rate limiting on sign-in.
- **Security**: per-request CSP with nonce in `proxy.ts`; static headers in `next.config.ts`
  (nosniff, Referrer-Policy, X-Frame-Options, COOP, Permissions-Policy).
- **i18n**: all user strings in message files; en/it key parity enforced by a unit test.
- **Zod** for forms, actions, handlers and env (`lib/env.ts`).
- **Tests**: Vitest `projects` (unit / integration with a global-setup DB); Playwright + axe for e2e.
- **Tooling**: ESLint 9 flat config (`eslint-config-next` + prettier), knip, shadcn only via CLI,
  `components/ui` never hand-edited and excluded from lint.
- **Prisma**: `prisma.config.ts`, `db:migrate` = `migrate deploy && generate`, seed via `tsx`.

Adapted here: layering, proxy/CSP pattern, env validation, test layout, shadcn-via-CLI rule.
Not adopted: pnpm (not installed here; staying on npm), no-locale-routing i18n (this site needs `/[locale]`),
credentials auth (this site uses an OAuth/email-allowlist flow).

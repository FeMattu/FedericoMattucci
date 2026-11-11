# Personal site: project memory

Minimal, elegant, bilingual personal site for Federico Mattucci (CV-style home, projects, skills, photo portfolio,
contact) with an in-site admin. Work happens on `feat/site-redesign`; never touch `main`, never force-push.

Read `docs/DECISIONS.md` and `.claude/memory/progress.md` at the start of every session. Other docs: `README.md`,
`docs/DEPLOY.md`, `docs/CONTENT_MAPPING.md`, `docs/CHANGELOG-REDESIGN.md`, `docs/issues-found.md`.

## Stack (exact versions in `package.json`)

Next 16.3.4 (App Router, `proxy.ts`), React 19.2, TypeScript strict (`noUncheckedIndexedAccess`), Tailwind 4,
shadcn/ui (`radix-nova`, installed **only** through the CLI, `src/components/ui` is never hand-edited), next-intl `/[locale]`
(`it` default, `en`), next-themes, Prisma 6.19 + PostgreSQL, Auth.js v5 (GitHub, `ADMIN_EMAIL`), zod 4, dnd-kit,
sharp + exifr, S3 + CloudFront for images, vitest 5, Playwright. npm (not pnpm).

## Layout

```
src/app/(site)/[locale]/   public pages (static; revalidate = 300 s + on every admin save)
src/app/(admin)/           root layout, /login, /admin/**  (the ONLY place with a sidebar)
src/actions/               server actions: admin, admin-site, uploads, contact
src/lib/                   admin/ (resource defs, schemas, queries) auth/ contact/ content/ db/repositories/
                           i18n/ photos/ storage/ uploads/ validation/   + env.ts (per-group zod env)
src/components/            admin/ detail/ home/ layout/ photos/ providers/ ui/
prisma/                    schema.prisma, additive migrations, seed.ts + seed-data.ts (create-only)
tests/                     unit/ (jsdom + node), integration/ (site_test DB), e2e/ (Playwright)
```

Layers: pages/actions -> `lib/content` + repositories (the **only** Prisma users) -> pure domain code.

## Rules

- English for code, identifiers, commits, docs. User-facing text only through `src/i18n/messages/{it,en}.json` or
  DB translations (`{ "it": "...", "en": "..." }`, default-language fallback via `localize()`). The admin UI is English.
- Public navigation is the sticky TOP bar. **Never add a sidebar to the public site**; the shadcn sidebar exists only
  under `/admin`. Don't render `<aside>`/sidebar markup on public pages (a test checks it).
- The public layout must stay **static**: no `auth()`, `cookies()` or `headers()` there. Admin awareness is a client
  hint (`useIsAdmin`), cosmetic only.
- Every admin page calls `requireAdmin()`; every server action calls `assertAdmin()` first (via `authorize()`), then
  validates with zod, writes through a repository, then `revalidatePath('/', 'layout')`. Return `ActionResult`, never throw to the UI.
- Writes only ever receive `toPrismaData()` output: fields not declared in `src/lib/admin/resources.ts` cannot reach the DB.
- Database: additive, backward-compatible migrations only; never delete data. Seeds are create-only (`upsert` with empty `update`).
- Images are signed server-side by `lib/storage/cdn.ts` **only for keys stored in the DB** (`isSafeKey`). Never expose a
  route that signs a caller-chosen key.
- Env is read per group: `env('storage')`, `env('auth')`, ... Don't validate everything at once (static builds must not need auth secrets).
- No `any` (lint-enforced). No secrets in git; `.env`, `.env.local` are ignored; `.env.example` is committed.
- Primary colour = blue via `--accent-light` / `--accent-dark` in `src/app/globals.css` (green alternative in the comment).
- Style: whitespace, thin borders, restrained colour, no heavy gradients; respect `prefers-reduced-motion`.
- Don't add a `loading.tsx` under `(site)/[locale]` (Suspense turns `notFound()` into HTTP 200).

## Commands

`npm run dev | build | lint | typecheck | test | test:integration | test:coverage | test:e2e | db:seed | photos:import`.
Gate before every commit: lint, `tsc --noEmit`, tests, `next build` (and `rm -rf .next` first: the folder is in OneDrive and
can lock `.next` with `EPERM`). Commit with Conventional Commits.

## Local environment

- Postgres: Docker container `fedmattucci-site-pg` on `127.0.0.1:54330` (db `site`, test db `site_test`, dev-only password).
  Do not touch the unrelated container `docker-db-1`. Integration/E2E setup refuses any DB whose name lacks "test".
- `.env` (Prisma CLI: `DATABASE_URL`) and `.env.local` (Next: everything) are git-ignored. Stop test servers with PowerShell
  `Get-NetTCPConnection -LocalPort <p>` (`pkill` does not work on Windows).
- The GateGuard hook asks for facts before first writes/destructive commands: state them, quote the user, then retry.
  Don't bypass it with shell writes.
- Two untracked Lambda files live in `src/app/api/image/*.py` (not part of the build): leave them alone.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Federico Mattucci: personal website

A minimal, bilingual (Italian / English) personal site: CV-style home, projects, skills, a photo portfolio, a
contact form, and an in-site admin to edit everything.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma + PostgreSQL ·
Auth.js v5 · next-intl · zod · S3 + CloudFront for images.

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in the values
npx prisma migrate deploy
npm run db:seed                 # CV content, idempotent
npm run dev
```

A local Postgres, GitHub OAuth app, S3/CloudFront and Vercel setup are explained in
[`docs/DEPLOY.md`](docs/DEPLOY.md).

## How it works

- **Public site** (`src/app/(site)/[locale]`): statically generated from the database, refreshed on every admin save
  and at most every 5 minutes. Top navigation only; no sidebar.
- **Admin** (`src/app/(admin)`, `/admin`): the only place with a sidebar. Sign-in with GitHub, restricted to
  `ADMIN_EMAIL`; every page and server action re-checks the session.
- **Content** is stored per language (`{ "it": "...", "en": "..." }`) and falls back to the default language.
- **Images** live in S3 and are served through CloudFront with short-lived signed URLs generated server-side.
- **Layers:** pages and server actions -> services -> repositories (the only Prisma users) -> pure domain code in
  `src/lib`.

```
src/
  app/(site)/[locale]/   public pages          app/(admin)/   login + admin
  actions/               server actions        components/    UI (ui/ = shadcn, never hand-edited)
  lib/                   domain code, repositories, content, uploads, auth
  i18n/                  routing + messages (it, en)
prisma/                  schema, additive migrations, idempotent seed
tests/                   unit, integration (test DB), e2e (Playwright)
docs/                    architecture, decisions, deploy, changelog
```

## Scripts

| Command                    | Does                                                        |
| -------------------------- | ----------------------------------------------------------- |
| `npm run dev`              | development server                                          |
| `npm run build`            | `prisma generate` + `next build`                            |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit`                                   |
| `npm test`                 | unit and component tests                                    |
| `npm run test:integration` | actions and services on the `site_test` database            |
| `npm run test:coverage`    | everything with coverage (threshold 80%)                    |
| `npm run test:e2e`         | Playwright flows on a production build                      |
| `npm run db:seed`          | idempotent seed from the CV                                 |
| `npm run photos:import`    | import the S3 photo library (`-- --dry` to preview)         |

## Documentation

- [`docs/CHANGELOG-REDESIGN.md`](docs/CHANGELOG-REDESIGN.md): what changed and how to test it
- [`docs/DEPLOY.md`](docs/DEPLOY.md): environment variables, Vercel, S3 CORS, local setup, rollback
- [`docs/CONTENT_MAPPING.md`](docs/CONTENT_MAPPING.md): where each piece of content comes from
- [`docs/DECISIONS.md`](docs/DECISIONS.md): choices made where the brief was ambiguous
- [`docs/issues-found.md`](docs/issues-found.md): problems of the old site and their status
- `docs/architecture-before.md` / `architecture-after.md`: Graphify maps of the code
- [`CLAUDE.md`](CLAUDE.md): conventions for working on this repository with Claude Code

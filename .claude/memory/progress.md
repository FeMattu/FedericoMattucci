# Progress log (read first in every session)
Branch: feat/site-redesign (push allowed by user; never main, never force).
Hooks: GateGuard asks for facts before first Write per directory / destructive Bash; state facts + quote the user, then retry. Do not bypass via shell writes.
Avoid apostrophes inside bash heredocs; use Write tool for JSON/text with quotes.

- [x] Phase 0 docs (architecture-before via Graphify CLI, issues, decisions, plan, CLAUDE.md)
- [x] Phase 1 tooling: next 16.3.4, react 19.2.8, prisma 6.19.3, vitest 5.1.0, next-auth beta.32, jsdom ^29 (Node 22.14),
      tsconfig/eslint/vitest.config.mts/prettier, src/env.ts (zod), .env.example, shadcn radix-nova + blue tokens (globals.css)
- [x] Phase 2 foundation: prisma/schema.prisma (NOT migrated: no Postgres/Docker running), src/i18n (it/en, /[locale] always),
      src/proxy.ts (intl + optimistic admin cookie gate), (site)/[locale] layout, top navbar (scroll-spy, mobile Sheet),
      theme toggle, language switcher, footer, skip link; libs localized/ordering/slug/dates; 23 unit tests green; build green
- [ ] NEXT: lib/db repositories + seed from CV (CV.tex mapped in docs/CONTENT_MAPPING.md), home sections, detail routes,
      skills tabs, projects grid+filter, photos (server-rendered, DB-backed, S3 signed only for registered keys), contact form+rate limit,
      sitemap/robots/OG, 404/error/loading, replace insecure /api/image + /api/images-list,
      Auth.js + /admin (shadcn Sidebar, CRUD, dnd-kit, S3 uploads, languages), integration + e2e tests, coverage >=80% lib/actions,
      docs (CHANGELOG-REDESIGN, DEPLOY, CONTENT_MAPPING, PR, architecture-after via graphify update)
- Public nav = top bar only. Admin: src/app/(admin)/admin, login /login (outside locale).
- Old public/data + public/languages kept only as seed source; delete after seed written.
- Blockers: no Postgres (Docker Desktop daemon was down; start it for migrations/integration tests).
- [x] Postgres dev: docker container fedmattucci-site-pg on 127.0.0.1:54330 (db site, site_test); .env/.env.local (ignored) hold DATABASE_URL(+_TEST). Do NOT touch container docker-db-1 (other project).
- [x] Migrations: init + skill_level_optional applied. Seed (prisma/seed.ts + seed-data.ts) idempotent, verified, preserves edits.
- [x] Content layer: repositories/content.ts, lib/content (view mappers + getHomeContent etc.), lib/storage (signing + cdn)
- [x] Public pages: home (hero, experience, education+certs, skills tabs, projects filter, contact links), detail routes experience/education/projects, 404/error, catch-all, sitemap, robots. 45 unit tests, build 26 static pages.
- [ ] NEXT: photos (S3 import script -> Photo rows, masonry grid, lightbox, albums/tags), contact form (zod, honeypot, rate limit, Resend, DB), delete insecure /api/image + /api/images-list, JSON-LD; then Auth.js + /admin; integration tests (DATABASE_URL_TEST); e2e; docs

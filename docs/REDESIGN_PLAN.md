# Redesign plan (branch `feat/site-redesign`)

Each phase ends with lint + `tsc --noEmit` + `vitest run` + `next build` green, then a Conventional Commit.

0. Docs + project memory (`CLAUDE.md`, `.claude/memory`)
1. Tooling: upgrade stack, eslint/vitest/prettier config, `src/env.ts`, npm scripts
2. Foundation: shadcn init, tokens (blue primary), next-themes, next-intl `/[locale]` routing, fonts
3. Data: Prisma schema (translatable content, order, status), baseline migration, repositories, seed from CV
4. Public site: top navbar, home sections, detail routes, skills, projects, photos, contact, SEO
5. Auth + admin: Auth.js, proxy, admin sidebar, CRUD, dnd-kit reorder, uploads, languages
6. Tests: unit, component, integration, smoke, Playwright flows, coverage thresholds
7. Docs: CHANGELOG-REDESIGN, DEPLOY, CONTENT_MAPPING, PR.md, architecture-after

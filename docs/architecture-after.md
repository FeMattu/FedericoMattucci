# Architecture after the redesign (`feat/site-redesign`)

Counterpart of `architecture-before.md`. The numbers come from Graphify (`graphify update src`, local AST extraction,
no LLM): full report and graph in `docs/graphify-after/` (`GRAPH_REPORT.md`, `graph.json`).

|                         | Before (`main` @ e62d249)                        | After                                                              |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| Source files mapped     | 23                                               | 121                                                                |
| Graph                   | 116 nodes, 251 edges, 7 communities              | 650 nodes, 1,847 edges, 19 communities                             |
| Import cycles           | none                                             | none                                                               |
| Hubs ("god nodes")      | `Link`, `getIcon()`, `HomePage()`, `S3Image()`   | `Button`, `Badge`, `requireAdmin()` (20 edges), `localize()` (18)  |
| Data                    | JSON files + live S3 listing                     | PostgreSQL (Prisma), images in S3 signed on demand                 |
| Rendering               | client components fetching JSON                  | static pages from the database, refreshed on save and every 5 minutes |
| Auth / admin            | none                                             | Auth.js v5, `/admin`                                               |
| Tests                   | none                                             | 312 unit/component/integration + 24 Playwright                     |

The hubs tell the story: before, the whole UI hung on a hand-made icon map and one 211-line client component. Now the
most-connected domain functions are the two that *should* be: `requireAdmin()` (every admin page and layout calls it)
and `localize()` (every translatable value goes through it).

## Request flow

```
Visitor ──> proxy.ts ──> next-intl (/it, /en)  ──>  (site)/[locale]/**  (static HTML, ISR)
                                                         │ build / revalidate
                                                         ▼
                                    lib/content ──> repositories/{content,photos} ──> Prisma ──> PostgreSQL
                                         │ pure mappers (localize, formatPeriod)
                                         └──> lib/storage/cdn.ts ──> signed CloudFront URLs (keys from the DB only)

Admin ───> proxy.ts (cookie check, optimistic) ──> (admin)/admin/**  requireAdmin() ── session ── Auth.js ── GitHub
                │
                └─> server actions (actions/*.ts)
                      assertAdmin() → zod (lib/admin/schema.ts) → repositories/admin.ts → Prisma
                      → revalidatePath('/', 'layout')            └─ uploads: presigned S3 PUT → sharp/exifr → Photo row
```

## Communities (from the graph)

Repositories and admin data layer · shadcn `ui/` primitives · photo gallery and lightbox · header/navigation · uploads
pipeline · contact service · home page and sections · sortable list · project detail · locale layout · content and photo
services · i18n config · Auth.js route handler. Two clusters are intentionally separate: everything the public site
imports, and everything under `/admin`; they share only `lib/` domain code and `ui/` primitives.

## Boundaries that are enforced

- **Only repositories touch Prisma** for content (plus the Auth.js adapter and the seed/import scripts).
- **Pure domain code has no I/O:** `lib/i18n`, `lib/photos`, `lib/admin/{resources,schema,translation-status,site-texts}`,
  `lib/uploads/validate`, `lib/storage/signing`, `lib/content/{view,photo-view}`, `lib/auth/allowlist`. These carry
  most of the unit tests.
- **`server-only`** guards every module that reads the database or secrets.
- **No sidebar on the public site**, enforced by a unit test and an E2E test; the public layout never calls `auth()`.
- **Writes only through `toPrismaData()`**, so a payload cannot set columns the resource definition does not declare.

## Where to look

| To change...                          | Start here                                                            |
| ------------------------------------- | --------------------------------------------------------------------- |
| a public section                      | `src/components/home/*`, `src/app/(site)/[locale]/page.tsx`           |
| what the admin can edit               | `src/lib/admin/resources.ts` (one line per field) + a migration       |
| translations of the UI                | `src/i18n/messages/{it,en}.json` (a test keeps their keys identical)  |
| the accent colour                     | `--accent-light` / `--accent-dark` in `src/app/globals.css`           |
| who may sign in                       | `ADMIN_EMAIL`, `src/lib/auth/allowlist.ts`                            |
| image handling                        | `src/lib/storage/*`, `src/lib/uploads/*`, `src/actions/uploads.ts`    |

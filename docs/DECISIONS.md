# Decisions

Where the brief was ambiguous or did not match the repository, the simplest minimal option was chosen and
recorded here.

## Premises that did not match

1. **No existing backend.** The brief assumes an existing Prisma schema, auth and vitest. None existed
   (`architecture-before.md`): the database is greenfield, so there was nothing to break. The first migration is the
   baseline; later ones are additive. Content comes from the LaTeX CV and the previous JSON/language files.
2. **`agb-portale-rdoc` was not readable.** It is private, no GitHub credentials were available (`gh` is not
   installed, git has no token) and the local copy under `1-ETHIBIT/AGB` is a static HTML prototype. `domus` was used
   as the architectural reference instead (`domus-reference-notes.md`).
3. **`/graphify` was not a local slash command.** Graphify was installed from `Graphify-Labs/graphify`
   (`pip install --user graphifyy`, `graphify install --platform claude`) and run through its CLI. It also created a
   global `~/.claude/CLAUDE.md`. Outputs: `graphify-before/` and `graphify-after/`.

## Architecture

4. **Storage: keep S3 + CloudFront** (already in use) instead of adding Vercel Blob. Admin uploads go browser -> S3 with a
   presigned PUT (server-generated key, type/size validated); the server then reads the object to extract size, EXIF
   and the blur placeholder, downsizes anything over 3200 px and creates the row. The bucket needs CORS for PUT.
   Deleting a photo in the admin removes it from the site but **leaves the S3 object** (no destructive storage
   operation from the web UI).
5. **Auth: Auth.js v5, GitHub OAuth, `ADMIN_EMAIL` allowlist, database sessions.** No passwords to store. The
   `signIn` callback runs before a user row is created, so strangers leave no trace. A layout check is not enough:
   `requireAdmin()` runs in every admin page and `assertAdmin()` in every server action.
6. **Public pages stay static.** No `auth()` in the public layout (it would make everything dynamic). The Admin link
   and the Edit-mode bar are decided in the browser: only browsers carrying a hint set in `/admin` ever call
   `/api/auth/session`. It is cosmetic; the server never trusts it.
7. **Translations are JSON maps per field** (`{ "it": "...", "en": "..." }`) with a fallback to the default language,
   not a separate `Translation` table: fewer joins, trivial to edit, easy to detect what is missing. Blank
   translations are dropped on save so the fallback keeps working.
8. **Adding a language** is two-part by design: the admin adds the language for *content* immediately; serving the
   public site in it also needs a messages file and one line in `src/i18n/config.ts` (routing is static).
9. **Admin UI is English only** and lives outside the locale routing (`/admin`, `/login`); content is edited per
   language.
10. **"In-place editing" became a contextual *Edit mode* bar** plus the dashboard: on any public page the signed-in admin
    gets an "Edit this page" button to the right editor. Editing text directly on the page was judged heavier than the
    brief's "simplest option" and would have complicated the static rendering.
11. **Generic editors driven by declarative resource definitions** (`src/lib/admin/resources.ts`): adding a field is one
    line plus a migration. Repositories are the only Prisma users; the one `as unknown as` cast is documented in
    `repositories/admin.ts` and writes only ever receive validated, declared fields.
12. **Rate limiting is database-backed** (5 per hour per sender, salted hash of the IP, no raw addresses), so it works on
    serverless without Redis.
13. **Signed CDN URLs** expire at UTC midnight + 8 days and pages revalidate every 5 minutes: cached HTML never holds a dead image
    link and the image cache keeps hitting.
14. **Environment is validated per group** (`env('storage')`, `env('auth')`, ...) so a feature only requires its own
    variables (the build of a static page must not demand auth secrets).
15. **No `loading.tsx` under `(site)/[locale]`:** it wraps pages in Suspense, so `notFound()` streamed HTTP 200 (a soft
    404). The pages are static, so a skeleton adds nothing.
16. **`recharts` and `exceljs` are not installed:** the site has no charts or spreadsheet export, so adding them would
    only be dead weight.
    - **16a. A stale-cache race found by the E2E suite.** Two admin saves within about a second could leave a stale
      public page cached: the first save's invalidation let the admin sidebar's `<Link href="/">` *prefetch* `/it`,
      that regeneration read the database before the second save, and it was written to the cache *after* the second
      invalidation. Fixes: the "View site" link no longer prefetches (admin pages never regenerate public ones), pages
      revalidate every **5 minutes** (not daily) so any residual race heals quickly, and invalidation is centralised in
      `src/lib/revalidate.ts` (it also targets the `[locale]` layout, since the app has two root layouts). Unit and
      integration tests mock `revalidatePath`, which is why only a real browser on a production build caught this.

## Tooling

17. **npm, not pnpm** (pnpm is not installed); the stray `pnpm` dependency was removed.
18. **Versions:** all versions from the brief are installed exactly (Next 16.3.4, React 19.2.8, Prisma 6.19.3,
    vitest 5.1.0, next-auth 5.0.0-beta.32). Exception: **`jsdom` is pinned to 29** because jsdom 31 needs Node >= 22.22
    and this machine runs 22.14.
19. **Playwright** runs against a production build in its own folder (`node_modules/.cache/next-e2e`) on the isolated `site_test` database
    with dummy storage credentials; integration and E2E setup refuse any database whose name lacks "test".
20. **The project lives in OneDrive**, which can lock `.next` (`EPERM` during `next build`); delete `.next` and rebuild.
21. **Local Postgres** is a Docker container on port 54330 with a throw-away dev password (documented in `DEPLOY.md`).

## Left for you

- Create the GitHub OAuth app, the Postgres database and the Vercel variables (`DEPLOY.md`).
- Configure the S3 bucket CORS for browser uploads.
- Add skill levels, project details and the CV link from the admin (`CONTENT_MAPPING.md`).
- Two untracked Lambda files (`src/app/api/image/lamda_function.py`, `metadata.py`) were left untouched; they are
  not part of the Next.js build (excluded from `tsconfig`).

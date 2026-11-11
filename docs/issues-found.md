# Issues found in the old site, and what happened to each

Found while analysing `main` (Next 15.2.4, no database, no tests) before the rebuild. **Status** is the state on
`feat/site-redesign`.

## Security

| # | Issue | Status |
| - | ----- | ------ |
| 1 | `/api/image?filename=` signed a CloudFront URL for **any** key the caller named, and `/api/images-list?path=` listed any S3 prefix: unauthenticated bucket enumeration. | **Fixed.** Both routes were deleted (they now return 404). Images are signed server-side, only for keys stored in the database (`lib/storage/cdn.ts`, keys checked with `isSafeKey`). |
| 2 | `CLOUDFRONT_PRIVATE_KEY.replace(/\n/g, '\n')` is a no-op, so multi-line keys kept in one env var broke. | **Fixed.** `normalizePrivateKey` converts literal `\n` sequences (unit-tested). |
| 3 | No security headers, no input validation, no rate limiting. | **Fixed.** Headers in `next.config.ts` (nosniff, Referrer-Policy, X-Frame-Options, COOP, Permissions-Policy); zod on every form and action; DB-backed rate limit on the contact form. |

## Performance

| # | Issue | Status |
| - | ----- | ------ |
| 4 | The gallery was client-only and N+1: one list call, then one `/api/image` call per photo, each signing two URLs and fetching a sidecar. | **Fixed.** One database query, server-rendered, signed URLs generated in one pass; EXIF and blur data are stored in the database. |
| 5 | `priority` on every gallery image defeated lazy loading. | **Fixed.** Grid images are lazy; only the lightbox image is prioritised. |
| 6 | Signed URLs expired after 1 h, so cached HTML would carry dead image links. | **Fixed.** Expiry rounded to the UTC day + 8 days, page revalidation every 5 minutes (`DECISIONS.md` 13). |
| 7 | The home page was a client component that fetched static JSON after mount (no SSR/SEO). | **Fixed.** Server-rendered and statically generated from the database. |

## Content

| # | Issue | Status |
| - | ----- | ------ |
| 8 | Home content was outdated (BSc in progress, "Computer Science Student"); the LaTeX CV now says BSc graduated, MSc in AI, JEVIS, Hastega, freelance, the POESIA thesis. | **Fixed.** Seeded from the current CV (`CONTENT_MAPPING.md`), editable from the admin. |
| 9 | `/contacts` had no form; contact data was read from a public JSON on the client. | **Fixed.** Contact section on the home page with a validated form; links come from the database. |

## Quality and accessibility

| # | Issue | Status |
| - | ----- | ------ |
| 10 | `/* eslint-disable */`, `any` types, hard-coded Italian strings ("Chiudi lightbox"), no `<main>`, no skip link, no sitemap/robots/hreflang/OG data. | **Fixed.** No `any` (lint-enforced), all UI text in the message files, `<main>` and a skip link, sitemap, robots, hreflang, canonical and Open Graph per page. |
| 11 | The lightbox had no keyboard navigation or focus trap; swipe only worked up/down. | **Fixed.** Radix Dialog (focus trap, Esc), arrow keys, `i` for details, horizontal swipe to navigate, swipe up/down for details. |
| 12 | The lint script was `next lint` (removed in Next 16) and there were no tests. | **Fixed.** ESLint 9 flat config; 312 unit, component and integration tests, 24 Playwright tests, coverage 97% on `src/lib` and `src/actions`. |
| 13 | `.next` and `.env.local` live in the project folder. | **Open, by design.** Both are git-ignored and were never committed. Note that the folder is inside OneDrive, which can lock `.next` (`DECISIONS.md` 20). |

## Found during the rebuild

| Issue | Status |
| ----- | ------ |
| Unknown URLs would have answered HTTP 200 with a Suspense `loading.tsx` (soft 404). | **Avoided.** No `loading.tsx`; unknown URLs and slugs return a real, localized 404. |
| 4 of the 15 photos have no metadata sidecar in S3 (no size, EXIF or blur). | **Open.** They import without metadata and use a 3:2 box; re-upload them from the admin to fill the data in. |
| Two Lambda files (`src/app/api/image/*.py`) sat untracked inside the Next.js app folder. | **Left as is.** They are excluded from the TypeScript build and do not ship; consider moving them to a separate `infra/` folder. |

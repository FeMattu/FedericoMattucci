# Issues found in the current site

## Security
1. `/api/image?filename=` signs a CloudFront URL for **any** key the caller names, and
   `/api/images-list?path=` lists any prefix: unauthenticated bucket enumeration.
   Fix: only serve keys that are registered in the DB (or under an allowlisted prefix).
2. `CLOUDFRONT_PRIVATE_KEY.replace(/\n/g, '\n')` is a no-op (meant `'\n'`): multi-line
   keys stored in a single env var break.
3. No security headers, no input validation, no rate limiting.

## Performance
4. Gallery is client-only and N+1: one list call, then one `/api/image` call per photo,
   each signing two URLs and fetching a sidecar. Nothing is server-rendered or cacheable.
5. `priority` is set on every gallery image, defeating lazy loading.
6. Signed URLs expire in 1 h, so cached/ISR HTML would carry dead image links.
7. Home page is a client component that fetches static JSON after mount (no SSR/SEO).

## Content
8. Home content is outdated (BSc in progress, "Computer Science Student"); the LaTeX CV
   now says BSc graduated, MSc AI, JEVIS, Hastega, freelance, thesis POESIA, etc.
9. `/contacts` has no form. Contact data is read from a public JSON on the client.

## Quality / a11y
10. `/* eslint-disable */` in S3image, `any` types, Italian hard-coded strings
    ("Chiudi lightbox"), no `<main>`, no skip link, no sitemap/robots/hreflang/OG data.
11. Lightbox has no keyboard navigation or focus trap; swipe only up/down for info.
12. Lint script is `next lint` (removed in Next 16). No tests exist.
13. `.next` and `.env.local` live in the folder (ignored by git; never commit).

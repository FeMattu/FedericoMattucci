# Redesign changelog (`feat/site-redesign`)

A complete rebuild of the site on a database-backed, editable foundation. Public routes are kept
(`/it`, `/en`, `/[locale]/portfolio` is now `/[locale]/photos`); see "Routes" for the one rename.

## What changed

### Public site

- **Top navigation only.** A sticky, translucent header with section links, language switcher and theme toggle; a
  sheet menu on mobile. There is no sidebar anywhere on the public site.
- **Home (CV style).** Minimal hero (name, role, location, short bio, your round profile photo from the previous site,
  "Contact me / Download CV / View portfolio"),
  then experience, education with certifications, skills, projects, a photo strip and contacts. Sections with no
  published content (projects, photos) disappear, and so do their nav links. Scroll-spy highlights the current
  section.
- **Detail pages** for every experience, education entry and project (`/[locale]/experience/[slug]`, ...): period,
  role, location, responsibilities, technologies, links, images; each with its own metadata, canonical URL, hreflang
  and Open Graph tags.
- **Skills, redone.** Tabs per category, readable badges, an optional level shown as five dots (never a made-up
  percentage), and a tooltip with years and context of use. Every category stays in the HTML.
- **Projects.** Card grid with cover, summary, technology tags, live/repo links and a tag filter.
- **Photos, rebuilt.** Server-rendered from the database with signed CDN URLs: masonry grid with blur placeholders,
  correct `sizes`, AVIF/WebP, album and tag filters, and a lightbox with keyboard (arrows, Esc, `i`) and swipe
  navigation plus a details panel (title, description, date, place, camera, lens, settings, size, tags).
- **Contact form.** Validated with zod, honeypot, database-backed rate limit (5 per hour per sender, stored as a
  salted hash, never the address), stored in the database, optional e-mail through Resend, accessible errors, keeps
  what you typed.
- **Italian and English**, routed as `/it` and `/en`, with browser-language detection and a switcher. Dynamic content
  is translatable per language and falls back to the default language.
- **Light / dark / system** theme with no flash. Primary colour is blue, defined by two CSS variables in
  `src/app/globals.css` (`--accent-light`, `--accent-dark`); the green alternative is in the comment above them.
- **SEO and quality.** `sitemap.xml`, `robots.txt`, per-locale metadata and hreflang, real 404s (localized), error
  page, skip link, visible focus, `prefers-reduced-motion` respected.

### Admin area (`/admin`, English UI)

- **Sign-in** with Auth.js v5 and GitHub. Only the e-mail in `ADMIN_EMAIL` can sign in; every admin page and every
  server action checks the session again.
- **Sidebar** (shadcn) exists only under `/admin`; the public site shows an *Admin* link and a floating *Edit mode*
  bar ("Edit this page" jumps to the right editor) only to the signed-in admin.
- **Editors** for experience, education, certifications, skills and categories, projects, social links, albums and
  photos: create, edit, duplicate (as a draft), delete (with confirmation), publish/unpublish, feature, and
  **drag-and-drop or keyboard reordering** that persists in `position`.
- **Translations**: one tab per language on every translatable field, with a marker where a language is still empty.
- **Photos**: multi-file upload straight to S3 (type and size validated, presigned URL); the server reads size and
  EXIF, builds the blur placeholder and downsizes anything over 3200 px. Choose visibility, featured, album, and edit
  title, description, alt text, place and tags per language.
- **Site texts** (profile photo upload, hero, bio, interests, SEO description, CV link), **Languages** (add a language, enable/disable, see
  how much is still untranslated) and **Messages** (contact inbox) screens, plus a dashboard.

### Under the hood

- Next 16.3.4, React 19.2.8, TypeScript strict, Tailwind 4, shadcn/ui (radix-nova), Prisma 6.19.3 + PostgreSQL,
  Auth.js v5, next-intl 4, zod 4, dnd-kit, sharp, exifr.
- Layering: pages and actions -> services -> repositories (the only Prisma users) -> pure domain code. Env is
  validated per group with zod (`src/env.ts`). No `any`.
- Database: additive migrations only (`init`, `skill_level_optional`, `message_ip_hash`).

## Known issue

- **Large photo originals can time out in the image optimizer** on a cold cache and slow connection (blank box until a
  reload). Not verified on Vercel. See `DEPLOY.md` section 7 for how to avoid it.

## Fixed (see `issues-found.md`)

- **Security:** the old `/api/image` signed a CloudFront URL for *any* key and `/api/images-list` listed *any* bucket
  prefix, unauthenticated. Both are gone; only keys registered in the database are signed, server-side.
- The CloudFront private key `replace(/\n/g, '\n')` no-op is fixed (`normalizePrivateKey`).
- Signed URLs expired after one hour while pages could be cached: now valid 8 days, rounded to the day, with 5-minute
  page revalidation.
- The gallery no longer makes one request per photo, no longer marks every image `priority`, and is server-rendered.
- Outdated home content replaced with the current CV.
- Security headers added; input validated everywhere; rate limit on the public write route.

## Removed

- `src/components/*` and pages of the old site, `react-icons`, `framer-motion`, both masonry libraries, `aws-sdk` v2,
  the stray `pnpm` dependency, the old `public/languages` and `public/data` content files.

## Routes

| Old                 | New                                        |
| ------------------- | ------------------------------------------ |
| `/[locale]`         | `/[locale]` (same)                         |
| `/[locale]/portfolio` | `/[locale]/photos`                       |
| `/[locale]/contacts`  | `/[locale]#contact`                      |

## How to test

```bash
npm install && npx prisma migrate deploy && npm run db:seed
npm run lint && npm run typecheck
npm test                       # unit + component tests
npm run test:integration       # services and server actions on the site_test database
npm run test:coverage          # everything + coverage (threshold 80% on src/lib and src/actions)
npm run test:e2e               # Playwright: public site, admin login, edit + reorder, language/theme switch
npm run build
npm run dev
```

Manual walk-through (Vercel preview or local):

1. `/it` and `/en`: the top bar, section anchors, language switcher, theme toggle; resize to a phone width: sheet menu.
2. Open an experience card, then a 404 URL (`/it/nope`): a real 404 in the right language.
3. `/it/photos`: filters, open a photo, use the arrow keys, `Esc`, swipe on a phone.
4. Contact form: submit with errors, then a valid message; it appears in `/admin/messages`.
5. `/admin` signed out: redirected to `/login`. Sign in with GitHub: dashboard and sidebar.
6. Edit an experience in both languages, reorder it, hide it: the public page follows within seconds.
7. Photos: upload one, set its title in both languages, feature it, check the home strip.
8. Languages: see the untranslated counts.

## Coverage and tests at the time of writing

- 312 unit, component and integration tests, plus 24 Playwright tests (desktop and mobile).
- Coverage on `src/lib` and `src/actions`: 97% lines, 97% statements, 98% functions, 91% branches.

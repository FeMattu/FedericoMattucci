# Deploying to Vercel

The site needs a PostgreSQL database, a GitHub OAuth app for the admin login, and the S3/CloudFront setup it already
uses. Until the variables below are set, a **Vercel preview of this branch will fail to build**: the pages are
generated from the database at build time.

## 1. Environment variables

Set them in Vercel -> Project -> Settings -> Environment Variables (Production, and Preview if you want previews to
build). Never commit them. `.env.example` lists the same names.

| Variable                 | Required | What it is                                                                                          |
| ------------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | yes      | PostgreSQL connection string (Neon, Supabase, Vercel Postgres, ...).                                |
| `AUTH_SECRET`            | yes      | Signs the session cookie. `npx auth secret`, or `openssl rand -base64 33`.                          |
| `AUTH_GITHUB_ID`         | yes      | Client ID of your GitHub OAuth app (see 2).                                                         |
| `AUTH_GITHUB_SECRET`     | yes      | Client secret of that app.                                                                          |
| `ADMIN_EMAIL`            | yes      | The **only** e-mail allowed to sign in to `/admin` (must be the primary e-mail of your GitHub account). |
| `AWS_REGION`             | yes      | Region of the bucket.                                                                               |
| `AWS_ACCESS_KEY_ID`      | yes      | IAM user for uploads and the photo import (needs `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`).  |
| `AWS_SECRET_ACCESS_KEY`  | yes      |                                                                                                     |
| `AWS_S3_BUCKET`          | yes      | Bucket holding `portfolio/` (photos) and `projects/` (covers).                                       |
| `CLOUDFRONT_URL`         | yes      | `https://xxxx.cloudfront.net` (no trailing slash needed).                                           |
| `CLOUDFRONT_KEY_PAIR_ID` | yes      | CloudFront public key ID used for signed URLs.                                                      |
| `CLOUDFRONT_PRIVATE_KEY` | yes      | The matching private key, **on one line with `\n` for line breaks**.                                |
| `RESEND_API_KEY`         | no       | Enables e-mail notifications for contact messages. Messages are always stored in the database.      |
| `CONTACT_TO_EMAIL`       | no       | Where notifications are sent.                                                                       |
| `CONTACT_FROM_EMAIL`     | no       | Verified Resend sender. Defaults to `onboarding@resend.dev` (works only for testing).               |
| `NEXT_PUBLIC_SITE_URL`   | yes      | Public URL, e.g. `https://federicomattucci.com`. Used for canonical links, hreflang and the sitemap.|

`AUTH_TRUST_HOST` is only needed locally; Vercel sets the host itself.

## 2. GitHub OAuth app

GitHub -> Settings -> Developer settings -> OAuth Apps -> New.

- Homepage URL: your production URL.
- Authorization callback URL: `https://<your-domain>/api/auth/callback/github`
- GitHub allows **one** callback URL per app, so preview deployments cannot sign in with the production app. Use a
  second OAuth app (callback `http://localhost:3000/api/auth/callback/github`) for local development, and test the
  admin on the production domain or a stable preview domain.

## 3. Build command and migrations

Set the Vercel **Build Command** to:

```
npm run build:vercel
```

which runs `prisma generate && prisma migrate deploy && next build`.

`migrate deploy` only applies migrations that have not run yet and never resets or drops anything. Every migration in
this branch is additive (a baseline plus two small additive ones: `skill_level_optional`, `message_ip_hash`). The
database is new, so there is no existing production data to protect; still, take a provider snapshot before the first
deploy, and before any later migration.

Seed the CV content **once** (idempotent, create-only, safe to re-run):

```bash
DATABASE_URL="<production url>" npm run db:seed
DATABASE_URL="<production url>" npm run photos:import   # needs the AWS_* and CLOUDFRONT_* variables too
```

Both commands read `.env.local` if present, so you can also put the production values there temporarily
(it is git-ignored). `photos:import --dry` only lists what it would import.

## 4. S3 bucket CORS (needed for admin uploads)

Photos and project covers are uploaded **from the browser straight to S3** with a short-lived presigned URL, so the
bucket must allow that origin. S3 -> bucket -> Permissions -> CORS:

```json
[
  {
    "AllowedOrigins": ["https://<your-domain>", "http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

Reading images needs no change: they are still served through CloudFront with signed URLs.

## 5. Local development

```bash
docker run -d --name site-pg -e POSTGRES_USER=site -e POSTGRES_PASSWORD=site_dev_only -e POSTGRES_DB=site \
  -p 127.0.0.1:54330:5432 postgres:17-alpine
docker exec site-pg psql -U site -d postgres -c "CREATE DATABASE site_test;"

cp .env.example .env.local        # fill in the values; DATABASE_URL=postgresql://site:site_dev_only@127.0.0.1:54330/site
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

`.env` (used by the Prisma CLI) only needs `DATABASE_URL`. The password above is a local, throw-away dev password.

| Script                    | Does                                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`             | Next dev server                                                             |
| `npm run build`           | `prisma generate` + `next build`                                            |
| `npm run build:vercel`    | adds `prisma migrate deploy` (use on Vercel)                                |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit`                                                  |
| `npm test`                | unit and component tests                                                    |
| `npm run test:integration`| server actions and services against the test database (`site_test`)        |
| `npm run test:coverage`   | unit + integration with the coverage report (threshold 80%)                 |
| `npm run test:e2e`        | Playwright flows (builds the app into `node_modules/.cache/next-e2e` on the test database)     |
| `npm run db:migrate`      | `prisma migrate deploy` + `generate`                                        |
| `npm run db:seed`         | idempotent CV seed                                                          |
| `npm run photos:import`   | import S3 photos (`-- --dry` to preview)                                    |

Integration and E2E tests refuse to run on a database whose name does not contain `test`.

> The project lives inside OneDrive, which can lock `.next` and make `next build` fail with `EPERM`. Delete `.next`
> and build again, or exclude the folder from sync.

## 6. Adding a language

1. Admin -> Languages -> *Add a language* (code such as `fr`): content can now be translated everywhere.
2. To serve the public site in that language: add `src/i18n/messages/fr.json` (copy `en.json` and translate) and add
   `'fr'` to `locales` (and a name to `localeNames`) in `src/i18n/config.ts`, then deploy.

## 7. Photo sizes and the image optimizer (known risk)

Your 15 existing photos are 6000 px originals of several MB each. `next/image` downloads the original from CloudFront
and re-encodes it (AVIF/WebP, right size) on the first request, and Next gives that download a fixed **7-second**
budget. On a slow connection with many large originals requested at once, some requests fail with HTTP 500
(`TimeoutError` in the server log) and that photo shows as a blank box until the page is reloaded; each success is
cached, so it heals by itself. I reproduced this on a development machine, but only on a cold cache; one image at a
time always worked. On Vercel the optimizer sits next to CloudFront and should be much faster, but this was **not
verified there**: check `/it/photos` on the first preview deployment with a hard refresh.

If you see blank photos in production:

- Re-upload the originals from the admin (*Photos -> Choose photos*): new uploads are downscaled to 3200 px on the long
  side automatically, which makes them several times smaller and removes the problem.
- Or export the existing photos at 3200 px before uploading them to S3.

## 8. Rollback

- Code: revert or redeploy the previous Vercel deployment; the migrations are additive, so the old tables stay valid.
- Data: restore the provider snapshot taken before the deploy.
- Admin access problems: check `ADMIN_EMAIL` matches your GitHub primary e-mail exactly (case-insensitive).

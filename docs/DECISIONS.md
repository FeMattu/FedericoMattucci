# Decisions

1. **Premise mismatch**: the brief assumes an existing Prisma schema, auth and vitest. None exist
   (see `architecture-before.md`). The database is therefore greenfield: nothing to break, and the first
   migration is the baseline. Content seeds come from the LaTeX CV and the existing JSON/language files.
2. **agb-portale-rdoc** is private and no GitHub credentials are available (`gh` not installed, git
   has no token); the local copy under `1-ETHIBIT/AGB` is a static HTML prototype. `domus` is
   used as the architectural reference instead.
3. **Image storage**: keep S3 + CloudFront (already in use) instead of adding Vercel Blob. Uploads from
   the admin go to S3 with a server-side presigned PUT; the DB stores the key and metadata.
4. **Package manager**: npm (pnpm is not installed); the stray `pnpm` dependency is removed.
5. **Versions**: exact versions from the brief are tried first; anything unresolvable is listed here.
6. **Auth provider**: Auth.js v5 with GitHub OAuth and an `ADMIN_EMAIL` allowlist (simplest; no
   passwords to store). Adapter: Prisma.
7. **Graphify**: installed from Graphify-Labs/graphify (`pip install --user graphifyy`, `graphify install --platform claude`); run via CLI because the skill was not registered until the next reload. Docs at `docs/graphify-before/`.
- jsdom pinned ^29: jsdom 31 needs Node >=22.22 (machine has 22.14)

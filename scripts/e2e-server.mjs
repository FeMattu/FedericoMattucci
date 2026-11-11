// Starts the production server for the Playwright suite (see playwright.config.ts).
// Everything points at the isolated TEST database and dummy storage credentials:
// the E2E run can never touch the dev database or the real S3 bucket.
import { spawn, spawnSync } from 'node:child_process'

const port = process.env.E2E_PORT ?? '3200'

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL_TEST ?? 'postgresql://site:site_dev_only@127.0.0.1:54330/site_test',
  ADMIN_EMAIL: 'e2e-admin@example.com',
  AUTH_SECRET: 'e2e-only-secret-e2e-only-secret-0000',
  AUTH_TRUST_HOST: 'true',
  AUTH_GITHUB_ID: 'e2e',
  AUTH_GITHUB_SECRET: 'e2e',
  NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
  // Separate build folder: the dev `.next` stays untouched. Inside node_modules so that
  // ESLint, git and the TypeScript project already ignore it.
  NEXT_DIST_DIR: 'node_modules/.cache/next-e2e',
  AWS_REGION: 'eu-west-1',
  AWS_ACCESS_KEY_ID: 'e2e',
  AWS_SECRET_ACCESS_KEY: 'e2e',
  AWS_S3_BUCKET: 'e2e-bucket',
  CLOUDFRONT_URL: 'https://cdn.e2e.invalid',
  CLOUDFRONT_KEY_PAIR_ID: 'E2E',
  CLOUDFRONT_PRIVATE_KEY: 'not-a-real-key',
}

function run(args) {
  const result = spawnSync('npx', args, { stdio: 'inherit', env, shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(['tsx', 'tests/e2e/prepare.ts'])
run(['next', 'build'])

const server = spawn('npx', ['next', 'start', '-p', port], { stdio: 'inherit', env, shell: true })
server.on('exit', (code) => process.exit(code ?? 0))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill())

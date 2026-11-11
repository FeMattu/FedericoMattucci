import { execSync } from 'node:child_process'

/**
 * Brings the TEST database to the current schema (migrate deploy) before the
 * integration tests run. Refuses to run against anything that does not look
 * like a test database, so a wrong DATABASE_URL can never be wiped.
 */
export default function setup() {
  const url = process.env.DATABASE_URL_TEST ?? 'postgresql://site:site_dev_only@127.0.0.1:54330/site_test'
  const database = new URL(url).pathname.replace(/^\//, '')
  if (!/test/i.test(database)) {
    throw new Error(`Refusing to run integration tests on database "${database}": its name must contain "test".`)
  }
  execSync('npx prisma migrate deploy', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: url },
  })
}

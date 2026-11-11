import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { generateKeyPairSync } from 'node:crypto'
import path from 'node:path'

/**
 * Integration tests use their own database, never the dev one. The default is
 * the dev-only local Docker Postgres (see docs/DEPLOY.md); CI sets DATABASE_URL_TEST.
 */
const testDatabaseUrl =
  process.env.DATABASE_URL_TEST ?? 'postgresql://site:site_dev_only@127.0.0.1:54330/site_test'

/**
 * Throwaway credentials for tests that sign CloudFront URLs or build an S3
 * client. Generated in memory on every run: nothing real, nothing on disk.
 */
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const testStorageEnv = {
  AWS_REGION: 'eu-west-1',
  AWS_ACCESS_KEY_ID: 'test-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret',
  AWS_S3_BUCKET: 'test-bucket',
  CLOUDFRONT_URL: 'https://cdn.test.example',
  CLOUDFRONT_KEY_PAIR_ID: 'KTESTPAIR',
  CLOUDFRONT_PRIVATE_KEY: privateKey.export({ type: 'pkcs1', format: 'pem' }).toString().replace(/\n/g, '\\n'),
}

const alias = {
  '@': path.resolve('src'),
  '@tests': path.resolve('tests'),
  // `server-only` throws outside the Next bundler; tests import server modules directly.
  'server-only': path.resolve('tests/stubs/server-only.ts'),
}

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    env: { TZ: 'Europe/Rome' },
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**', 'src/actions/**'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          env: { TZ: 'Europe/Rome', ...testStorageEnv },
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          // One shared database: files run one after another.
          fileParallelism: false,
          globalSetup: ['tests/integration/global-setup.ts'],
          setupFiles: [],
          env: { TZ: 'Europe/Rome', DATABASE_URL: testDatabaseUrl, ...testStorageEnv },
        },
      },
    ],
  },
})

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

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
        test: { name: 'unit', include: ['tests/unit/**/*.test.{ts,tsx}'], environment: 'jsdom' },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          fileParallelism: false,
        },
      },
    ],
  },
})

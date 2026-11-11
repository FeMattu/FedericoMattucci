import { describe, expect, it } from 'vitest'
import { parseEnv } from '@/env'

const valid = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  AUTH_SECRET: 'x'.repeat(32),
  AUTH_GITHUB_ID: 'id',
  AUTH_GITHUB_SECRET: 'secret',
  ADMIN_EMAIL: 'admin@example.com',
  AWS_REGION: 'eu-west-1',
  AWS_ACCESS_KEY_ID: 'key',
  AWS_SECRET_ACCESS_KEY: 'secret',
  AWS_S3_BUCKET: 'bucket',
  CLOUDFRONT_URL: 'https://cdn.example.com',
  CLOUDFRONT_KEY_PAIR_ID: 'kp',
  CLOUDFRONT_PRIVATE_KEY: 'pem',
}

describe('parseEnv', () => {
  it('accepts a complete environment and defaults the site URL', () => {
    const env = parseEnv(valid)
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000')
    expect(env.RESEND_API_KEY).toBeUndefined()
  })

  it('names the invalid variables without leaking their values', () => {
    expect(() => parseEnv({ ...valid, ADMIN_EMAIL: 'not-an-email', AUTH_SECRET: 'short' })).toThrow(
      /ADMIN_EMAIL.*AUTH_SECRET|AUTH_SECRET.*ADMIN_EMAIL/,
    )
    try {
      parseEnv({ ...valid, AUTH_SECRET: 'short' })
    } catch (error) {
      expect(String(error)).not.toContain('short')
    }
  })
})

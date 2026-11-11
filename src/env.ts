import { z } from 'zod'

/**
 * Environment, validated per group. Each feature asks only for the group it
 * needs (`env('storage')`, `env('auth')`, ...), so e.g. signing a photo URL
 * during `next build` never requires the auth secrets, and a missing group
 * fails with a message naming the variables (never their values).
 */
const groups = {
  database: z.object({ DATABASE_URL: z.string().min(1) }),
  auth: z.object({
    AUTH_SECRET: z.string().min(16),
    AUTH_GITHUB_ID: z.string().min(1),
    AUTH_GITHUB_SECRET: z.string().min(1),
    ADMIN_EMAIL: z.string().email(),
  }),
  storage: z.object({
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_S3_BUCKET: z.string().min(1),
    CLOUDFRONT_URL: z.string().url(),
    CLOUDFRONT_KEY_PAIR_ID: z.string().min(1),
    CLOUDFRONT_PRIVATE_KEY: z.string().min(1),
  }),
  mail: z.object({
    RESEND_API_KEY: z.string().optional(),
    CONTACT_TO_EMAIL: z.string().email().optional(),
  }),
  site: z.object({ NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000') }),
}

export type EnvGroup = keyof typeof groups
export type EnvOf<G extends EnvGroup> = z.infer<(typeof groups)[G]>
type Source = Record<string, string | undefined>

/** Parses one group of an env record. Pure: easy to test. */
export function parseEnvGroup<G extends EnvGroup>(group: G, source: Source): EnvOf<G> {
  const result = groups[group].safeParse(source)
  if (!result.success) {
    const names = result.error.issues.map((i) => i.path.join('.')).join(', ')
    throw new Error(`Invalid environment (${group}): ${names}`)
  }
  return result.data as EnvOf<G>
}

/** Parses every group at once (deploy checks, tests). */
export function parseEnv(source: Source) {
  return {
    ...parseEnvGroup('database', source),
    ...parseEnvGroup('auth', source),
    ...parseEnvGroup('storage', source),
    ...parseEnvGroup('mail', source),
    ...parseEnvGroup('site', source),
  }
}

const cache = new Map<EnvGroup, unknown>()

/** Lazy and cached per group. */
export function env<G extends EnvGroup>(group: G): EnvOf<G> {
  if (!cache.has(group)) cache.set(group, parseEnvGroup(group, process.env))
  return cache.get(group) as EnvOf<G>
}

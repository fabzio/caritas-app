import { treeifyError, z } from 'zod'

z.config(z.locales.es())
const EnvSchema = z.discriminatedUnion('NODE_ENV', [
  z.object({
    PORT: z.coerce.number().default(8000),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    DATABASE_URL: z.string(),
    VALKEY_URL: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().default(465),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string(),
  }),
  z.object({
    PORT: z.coerce.number().default(8000),
    NODE_ENV: z.literal('test'),
    DATABASE_URL: z.string().default('memory://'),
    GOOGLE_CLIENT_ID: z.string().default('test'),
    GOOGLE_CLIENT_SECRET: z.string().default('test'),
    SMTP_HOST: z.string().default('smtp.test'),
    SMTP_PORT: z.coerce.number().default(465),
    SMTP_USER: z.string().default('test'),
    SMTP_PASSWORD: z.string().default('test'),
    BETTER_AUTH_URL: z.string().default('http://localhost:8000'),
    CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().default('test'),
  }),
])

type Config = z.infer<typeof EnvSchema>

const env: Config = (() => {
  try {
    console.info('Env: ', process.env.NODE_ENV)
    return EnvSchema.parse(process.env)
  } catch (e) {
    const error = e as z.ZodError
    console.error('❌ Invalid environment variables:')
    console.dir(
      treeifyError(error),

      {
        depth: null,
        colors: true,
      },
    )
    process.exit(1)
  }
})()

export default env

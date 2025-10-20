import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).default('Cáritas Lima 365'),
    VITE_ORG_NAME: z.string().min(1).default('Cáritas Lima'),
    VITE_API_URL: z.string().url().default('http://localhost:5173'),
    VITE_GOOGLE_CLIENT_ID: z
      .string()
      .default(
        '381831022349-oc421cd5jg888jnlces6lvnkmq0brkp3.apps.googleusercontent.com',
      ),
    VITE_CLOUDFLARE_TURNSTILE_SITE_KEY: z
      .string()
      .default('0x4AAAAAAB3NCsVLdXRV7O1H'),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: import.meta.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})

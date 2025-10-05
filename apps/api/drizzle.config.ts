import env from '@api/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: 'src/db/schemas/*',
  dialect: 'postgresql',
  casing: 'snake_case',
  schemaFilter: ['auth', 'education', 'health'],
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})

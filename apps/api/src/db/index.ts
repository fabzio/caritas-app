import env from '@api/env'
import { drizzle as drizzleBun } from 'drizzle-orm/bun-sql'
import { drizzle as drizzleLite } from 'drizzle-orm/pglite'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as authSchema from './schemas/auth'
import * as educationSchema from './schemas/education'
import * as healthSchema from './schemas/health'

declare global {
  var db: PostgresJsDatabase<typeof schema>
}
export const schema = {
  ...authSchema,
  ...educationSchema,
  ...healthSchema,
}

// biome-ignore lint/suspicious/noRedeclare: global instance is needed for dev
let db: PostgresJsDatabase<typeof schema> | undefined
if (env.NODE_ENV === 'production') {
  db = drizzleBun(env.DATABASE_URL, {
    schema,
    casing: 'snake_case',
  })
} else if (env.NODE_ENV === 'development') {
  if (!global.db)
    db = drizzleBun(env.DATABASE_URL, {
      schema,
      casing: 'snake_case',
    })
} else if (env.NODE_ENV === 'test') {
  db = drizzleLite({
    schema,
  })
} else {
  console.error('❌ Database not initialized')
  process.exit(1)
}

// biome-ignore lint/style/noNonNullAssertion: injected at runtime
export default db!

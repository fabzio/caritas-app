import { pushSchema } from 'drizzle-kit/api'
import { drizzle as drizzleBun } from 'drizzle-orm/bun-sql'
import { drizzle as drizzleLite } from 'drizzle-orm/pglite'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import env from '@/env'
import * as authSchema from './schemas/auth'
import * as educationSchema from './schemas/education'
import * as healthSchema from './schemas/health'

declare global {
  var db: PostgresJsDatabase<typeof schema>
}
const schema = {
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
  // biome-ignore lint/suspicious/noExplicitAny: for testing only
  const { apply } = await pushSchema(schema, db as any)
  await apply()
} else {
  console.error('❌ Database not initialized')
  process.exit(1)
}

// biome-ignore lint/style/noNonNullAssertion: injected at runtime
export default db!

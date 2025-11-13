import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from './schema'

const client = new PGlite('idb://health-analytics')

const db = drizzle(client, {
  schema,
})

export default db

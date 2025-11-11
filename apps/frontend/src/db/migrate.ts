/** biome-ignore-all lint/style/noNonNullAssertion: dialect and session will appear to not exist...but they do*/
import type { MigrationConfig } from 'drizzle-orm/migrator'
import db from '.'
import migrations from './migrations.json'

export async function migrate() {
  db.dialect!.migrate(migrations, db.session!, {
    migrationsTable: 'drizzle_migrations',
  } satisfies Omit<MigrationConfig, 'migrationsFolder'>)
}

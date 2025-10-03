import { region } from '@api/db/schemas/auth'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export namespace RegionModel {
  const _getRegions = createSelectSchema(region)
  export const getRegions = t.Array(_getRegions)
  export type GetRegions = typeof getRegions.static
}

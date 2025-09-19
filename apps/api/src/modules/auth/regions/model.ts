import { t } from 'elysia'

export namespace RegionModel {
  const _getRegions = t.Object({
    id: t.Integer(),
    name: t.String(),
  })
  export const getRegions = t.Array(_getRegions)
  export type GetRegions = typeof getRegions.static
}

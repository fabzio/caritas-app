import db from '@/db'
import type { RegionModel } from './model'

export const getRegions = async (): Promise<RegionModel.GetRegions> => {
  return await db.query.region.findMany()
}

import FairPage from '@frontend/modules/organization/pages/education/fair'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export type FairsFilters = Filters & {
  district?: string
  status?: string
}

const fairsFiltersSchema = z.object({
  district: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
  pageIndex: z.number().optional(),
  pageSize: z.number().optional(),
  sortBy: z.string().optional(),
})

export const Route = createFileRoute(
  '/_authenticated/organization/education/fair/',
)({
  validateSearch: fairsFiltersSchema,
  component: FairPage,
})

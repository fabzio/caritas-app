import FairPage from '@frontend/modules/organization/pages/education/fair'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type FairsFilters = Filters & {
  district?: string
  status?: string
}

export const Route = createFileRoute(
  '/_authenticated/organization/education/fair/',
)({
  validateSearch: () => ({}) as FairsFilters,
  component: FairPage,
})

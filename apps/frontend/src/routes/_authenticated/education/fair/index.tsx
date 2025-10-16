import FairPage from '@frontend/modules/education/pages/fair'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type FairsFilters = Filters

export const Route = createFileRoute('/_authenticated/education/fair/')({
  component: FairPage,
  validateSearch: () => ({}) as FairsFilters,
})

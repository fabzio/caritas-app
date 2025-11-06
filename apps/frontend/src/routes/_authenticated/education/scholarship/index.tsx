import ScholarshipPage from '@frontend/modules/education/pages/scholarship'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type ScholarshipFilters = Filters & {
  name?: string
  active?: boolean
}

export const Route = createFileRoute('/_authenticated/education/scholarship/')({
  validateSearch: () => ({}) as ScholarshipFilters,
  component: ScholarshipPage,
})

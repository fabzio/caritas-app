import CreateReportPage from '@frontend/modules/organization/pages/education/scholarship/create-report'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
export const Route = createFileRoute(
  '/_authenticated/organization/education/scholarship/report',
)({
  component: CreateReportPage,
  validateSearch: z.object({
    id: z.optional(z.union([z.string(), z.number()])),
    type: z.enum(['new', 'edit']),
  }),
})

import CreateScholarshipRecipient from '@frontend/modules/education/pages/scholarship-recipients/create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/education/recipients/create',
)({
  component: CreateScholarshipRecipient,
})

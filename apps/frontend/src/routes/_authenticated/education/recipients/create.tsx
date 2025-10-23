import CreateScholarshipRecipient from '@frontend/modules/education/pages/scholarship-recipients/pages/create-scholarship-recipient'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/education/recipients/create',
)({
  component: CreateScholarshipRecipient,
})

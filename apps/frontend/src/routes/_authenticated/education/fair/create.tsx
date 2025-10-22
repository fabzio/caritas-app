import CreateFairPage from '@frontend/modules/education/pages/fair/pages/create-fair'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/education/fair/create')({
  component: CreateFairPage,
})

import UserFormView from '@frontend/modules/admin/pages/users/subpages/userFormView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/users/form')({
  component: UserFormView,
})

import General from '@frontend/modules/user/pages/general'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/user/')({
  component: General,
})

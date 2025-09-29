import { createFileRoute } from '@tanstack/react-router'
import General from '@/modules/user/pages/general'

export const Route = createFileRoute('/_authenticated/user/')({
  component: General,
})

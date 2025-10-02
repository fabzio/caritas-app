import { createFileRoute } from '@tanstack/react-router'
import Scholarship from '@/modules/education/pages/scholarship-recipients'

export const Route = createFileRoute('/_authenticated/education/recipients')({
  component: Scholarship,
})

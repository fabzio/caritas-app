import { createFileRoute } from '@tanstack/react-router'
import ScholarshipPage from '@/modules/education/pages/scholarship'

export const Route = createFileRoute('/_authenticated/education/scholarship/')({
  component: ScholarshipPage,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/education/scholarship/"!</div>
}

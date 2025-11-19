import { PagePlaceholder } from '@frontend/shared/components/page-placeholder'
import { createFileRoute } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/education/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PagePlaceholder
      icon={GraduationCap}
      title="Experiencia de educación en preparación"
      description="Estamos afinando los tableros y reportes educativos para tu organización. Mientras tanto, ingresa directamente a Becas, Ferias u otros módulos desde el menú lateral."
    />
  )
}

import { PagePlaceholder } from '@frontend/shared/components/page-placeholder'
import { createFileRoute } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/organization/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PagePlaceholder
      icon={Building2}
      title="Panel de organización en construcción"
      description="Muy pronto podrás revisar métricas clave y accesos rápidos para coordinar tus programas. Mientras tanto, navega desde el menú lateral hacia los módulos disponibles."
    />
  )
}

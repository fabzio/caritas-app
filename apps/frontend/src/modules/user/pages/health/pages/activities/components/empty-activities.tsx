import { useFilters } from '@frontend/hooks/use-filters'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { HeartCrack } from 'lucide-react'

type Props = {
  mode: 'active' | 'history'
}
export default function EmptyActivities({ mode }: Readonly<Props>) {
  const { filters } = useFilters('/_authenticated/user/health/activities/')
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HeartCrack />
        </EmptyMedia>
        <EmptyTitle>Sin actividades</EmptyTitle>
        <EmptyDescription>
          {mode === 'active'
            ? 'No se han encontrado actividades activas en este momento. ¡Vuelve más tarde para ver nuevas oportunidades!'
            : mapHistoryMessage[
                filters?.view as keyof typeof mapHistoryMessage
              ]}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

const mapHistoryMessage = {
  participated:
    'No has participado en ninguna actividad finalizada aún, ¡anímate a unirte!',
  notParticipated:
    'No hay actividades finalizadas en las que no hayas participado. ¡Sigue asistiendo a las actividades!',
  canceled: 'No hay actividades canceladas en las que estuvieras registrado.',
} as const

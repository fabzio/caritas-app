import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Clock, MapPin, UserRound } from 'lucide-react'
import type { useUserActivities } from '../hooks/use-user-activities'

type Props = NonNullable<
  ReturnType<typeof useUserActivities>['data']
>['data'][number]

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export default function ActivityCard(props: Readonly<Props>) {
  const {
    name,
    date,
    duration,
    statusName,
    typeName,
    regionName,
    creatorName,
    registered,
  } = props

  const formattedDate = format(new Date(date), 'dd/MM/yy', { locale: es })
  const formattedDuration = formatDuration(duration)
  const navigate = useNavigate()
  const handleClick = () => {
    if (!registered) return
    navigate({
      to: '/user/health/activities/$id',
      params: { id: props.id.toString() },
    })
  }
  return (
    <Card className="transition-shadow hover:shadow-md" onClick={handleClick}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col space-y-2">
            <Badge
              variant="outline"
              className="uppercase text-xs tracking-wide"
            >
              {typeName}
            </Badge>
            <h3 className="text-lg font-semibold leading-tight text-foreground">
              {name}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={statusVariant(statusName)}
              className="px-3 py-1 text-xs capitalize"
            >
              {statusName}
            </Badge>
            {registered && (
              <Badge className="px-3 py-1 text-xs">Registrado</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>Fecha:</span>
          <span className="font-medium text-foreground">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Duración:</span>
          <span className="font-medium text-foreground">
            {formattedDuration}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>Región:</span>
          <span className="font-medium text-foreground">{regionName}</span>
        </div>
        {creatorName && (
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>Responsable:</span>
            <span className="font-medium text-foreground">{creatorName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const statusVariant = (statusName: string): BadgeVariant => {
  const normalized = statusName.toLowerCase()
  if (normalized.includes('cancel')) return 'destructive'
  if (normalized.includes('complet')) return 'default'
  if (normalized.includes('progreso') || normalized.includes('activo'))
    return 'default'
  return 'secondary'
}

const formatDuration = (value: string) => {
  const [hoursRaw = '0', minutesRaw = '0'] = value.split(':')
  const hours = Number.parseInt(hoursRaw, 10)
  const minutes = Number.parseInt(minutesRaw, 10)
  const chunks = [] as string[]
  if (Number.isFinite(hours) && hours > 0) chunks.push(`${hours}h`)
  if (Number.isFinite(minutes) && minutes > 0) chunks.push(`${minutes}min`)
  if (chunks.length === 0) return '0min'
  return chunks.join(' ')
}

import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock } from 'lucide-react'
import type { UserAttention } from '../hooks/use-user-attentions'

interface AttentionCardProps {
  attention: UserAttention
  onClick?: (attention: UserAttention) => void
}

export default function AttentionCard({
  attention,
  onClick,
}: Readonly<AttentionCardProps>) {
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ''
    try {
      const date = new Date(timeStr)
      return format(date, 'hh:mm a', { locale: es })
    } catch {
      return ''
    }
  }

  const isCompleted = attention.hasAttention && attention.attentionTime

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        attention.hasAttention
          ? 'border-muted-foreground/30'
          : 'border-primary',
      )}
      onClick={() => onClick?.(attention)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-base leading-tight">
              {attention.specialityName}
            </p>
            <p
              className={cn('text-xs text-muted-foreground/80 max-w-[180px]')}
              title={attention.alliedName}
            >
              {attention.alliedName}
            </p>
          </div>

          {isCompleted ? (
            <p className="text-sm text-muted-foreground">
              {formatTime(attention.attentionTime)}
            </p>
          ) : (
            <Badge variant="default" className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Pendiente
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

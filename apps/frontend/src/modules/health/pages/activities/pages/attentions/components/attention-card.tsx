import { Card, CardContent } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface Attention {
  specialityId: number
  specialityName: string
  hasAttention: boolean
  attentionId: number | null
  attentionTime: string | null
  observations: string | null
}

interface AttentionCardProps {
  attention: Attention
  onClick?: (attention: Attention) => void
}

export default function AttentionCard({
  attention,
  onClick,
}: AttentionCardProps) {
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ''
    try {
      const date = new Date(timeStr)
      return format(date, 'hh:mm a', { locale: es })
    } catch {
      return ''
    }
  }

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
          <p className="font-medium text-base">{attention.specialityName}</p>
          {attention.hasAttention && attention.attentionTime ? (
            <p className="text-sm text-muted-foreground">
              {formatTime(attention.attentionTime)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Pendiente</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

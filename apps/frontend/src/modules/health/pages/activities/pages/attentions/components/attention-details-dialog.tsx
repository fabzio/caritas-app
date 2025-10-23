import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AttentionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  specialityName: string
  attentionTime: string | null
  observations: string | null
}

export default function AttentionDetailsDialog({
  open,
  onOpenChange,
  specialityName,
  attentionTime,
  observations,
}: Readonly<AttentionDetailsDialogProps>) {
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return 'No registrado'
    try {
      const date = new Date(timeStr)
      return format(date, "dd 'de' MMMM 'de' yyyy - hh:mm a", { locale: es })
    } catch {
      return 'Formato inválido'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{specialityName}</DialogTitle>
          <DialogDescription>Detalles de la atención</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Fecha y hora
            </h4>
            <p className="text-sm">{formatTime(attentionTime)}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Observaciones
            </h4>
            <p className="text-sm">
              {observations || 'Sin observaciones registradas'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

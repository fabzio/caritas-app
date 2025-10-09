import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function DeleteSelfAdminDialog({
  open,
  onOpenChange,
  onConfirm,
}: Readonly<Props>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advertencia</DialogTitle>
          <DialogDescription>
            Estás a punto de eliminar tus propios permisos de administrador, ya
            no podrás acceder a esta sección.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Entiendo las consecuencias
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

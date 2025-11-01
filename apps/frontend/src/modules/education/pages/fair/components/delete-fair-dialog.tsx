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
import useDeleteFairs from '../hooks/use-delete-fair'

interface DeleteConfirmationDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly selectedCount: number
  readonly ids: number[]
  readonly clearSelection?: () => void
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  selectedCount,
  ids,
  clearSelection,
}: DeleteConfirmationDialogProps) {
  const { mutateAsync: deleteFairs, isPending } = useDeleteFairs()
  const handleConfirmDelete = async () => {
    deleteFairs({ ids })
    onOpenChange(false)
    clearSelection?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {`¿Seguro que desea eliminar ${selectedCount} beca${
              selectedCount > 1 ? 's' : ''
            }?`}
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Las becas serán marcadas como
            inactivas.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isPending}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import useDeleteAllies from '../hooks/use-delete-ally'

interface DeleteConfirmationDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly selectedCount: number
  readonly ids: string[]
  readonly clearSelection?: () => void
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  selectedCount,
  ids,
  clearSelection,
}: DeleteConfirmationDialogProps) {
  const { mutateAsync: deleteOrganizations, isPending } = useDeleteAllies()

  const handleConfirmDelete = async () => {
    await deleteOrganizations({ ids })
    onOpenChange(false)
    clearSelection?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {`¿Seguro que desea eliminar ${selectedCount} organizaci${ids.length === 1 ? 'ón' : 'ones'}?`}
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer
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

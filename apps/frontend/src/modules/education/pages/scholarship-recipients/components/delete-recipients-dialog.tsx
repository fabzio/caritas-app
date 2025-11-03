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
import { Textarea } from '@workspace/ui/components/textarea'
import { useState } from 'react'
import { useDeleteRecipients } from '../hooks/use-delete-recipients'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  ids: number[]
  clearSelection?: () => void
}

export default function DeleteRecipientsDialog({
  open,
  onOpenChange,
  selectedCount,
  ids,
  clearSelection,
}: Readonly<Props>) {
  const [comments, setComments] = useState('')
  const { mutateAsync: deleteRecipients, isPending } = useDeleteRecipients()

  const handleConfirm = async () => {
    await deleteRecipients({ ids, comments })
    onOpenChange(false)
    clearSelection?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {`¿Seguro que desea dar de baja ${selectedCount} becado${
              ids.length === 1 ? '' : 's'
            }?`}
          </DialogTitle>
          <DialogDescription>
            Esta acción marcará a los becados como rechazados. Puede agregar un
            comentario opcional.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Comentario (opcional)"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>

          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { useUpdateActivityUser } from '../hooks/use-update-activity-user'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  activityId: string | number
}

export default function ConfirmIncentiveDialog({
  open,
  onOpenChange,
  userId,
  activityId,
}: Readonly<Props>) {
  const { mutate: updateActivityUser, isPending: isPendingUpdate } =
    useUpdateActivityUser()

  const handleMarkIncentive = () => {
    updateActivityUser({
      userId,
      activityId: Number(activityId),
      rewarded: true,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {`¿Seguro que desea marcar el registro de incentivo?`}
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer.
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
            onClick={handleMarkIncentive}
            disabled={isPendingUpdate}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

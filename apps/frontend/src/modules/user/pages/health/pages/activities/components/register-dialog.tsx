import { useSession } from '@frontend/hooks/use-session'
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
import { Spinner } from '@workspace/ui/components/spinner'
import { useRegister } from '../hooks/use-register'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityId?: number
  activityName?: string
  activityDate?: Date
}
export default function RegisterDialog({
  activityId,
  activityName,
  activityDate,
  open,
  onOpenChange,
}: Readonly<Props>) {
  const { mutate, isPending } = useRegister()
  const { data: session } = useSession()
  const handleClick = () => {
    mutate({
      activityId: activityId as number,
      userId: session?.user.id as string,
    })
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registro en actividad</DialogTitle>
          <DialogDescription>
            ¿Deseas registrarte en la actividad <strong>{activityName}</strong>{' '}
            que se realizará el{' '}
            <strong>{activityDate?.toLocaleDateString()}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleClick} disabled={isPending}>
            {isPending ? <Spinner /> : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

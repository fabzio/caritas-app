import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Spinner } from '@workspace/ui/components/spinner'
import { MailWarning } from 'lucide-react'
import { useState } from 'react'
import { useRejectInvitation } from '../hooks/use-reject-invitation'

type Props = {
  organizationName?: string
  invitationId: string
}
export default function RejectInvitation({
  organizationName,
  invitationId,
}: Readonly<Props>) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useRejectInvitation()
  const handleReject = () => {
    mutate(invitationId, {
      onSuccess: () => {
        setOpen(false)
      },
    })
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Rechazar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar invitación</DialogTitle>
          <DialogDescription>
            <div className="flex justify-center py-4">
              <MailWarning size={32} />
            </div>
            ¿Deseas rechazar la invitación a unirte a la organización{' '}
            <strong>
              {organizationName ?? (
                <Skeleton className="w-24 h-5 inline-block" />
              )}
            </strong>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : 'Rechazar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

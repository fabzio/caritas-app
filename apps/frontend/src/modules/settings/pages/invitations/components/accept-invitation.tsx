import {
  getRouteApi,
  Link,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { Spinner } from '@workspace/ui/components/spinner'
import { MailCheck, MailX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAcceptInvitation } from '../hooks/use-accept-invitation'

export default function AcceptInvitation() {
  const navigate = useNavigate({ from: '/settings/invitations' })
  const { id, redirect } = useSearch({
    from: '/_authenticated/settings/invitations',
  })
  const data = getRouteApi(
    '/_authenticated/settings/invitations',
  ).useLoaderData()
  const [open, setOpen] = useState(!!id)

  useEffect(() => {
    setOpen(!!id)
  }, [id])
  const invitation = data.find((invitation) => invitation.id === id)
  const { mutate, isPending } = useAcceptInvitation()
  const handleConfirm = () => {
    if (!id) return
    mutate(id, {
      onSuccess: () => {
        navigate({ to: '.', search: { redirect } })
      },
    })
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) navigate({ to: '.', search: { redirect } })
        setOpen(val)
      }}
    >
      <DialogContent>
        {invitation ? (
          <>
            <DialogHeader>
              <DialogTitle>Aceptar invitación </DialogTitle>
              <DialogDescription>
                <div className="flex justify-center py-4">
                  <MailCheck size={32} />
                </div>
                ¿Deseas aceptar esta invitación de{' '}
                <strong>{invitation.inviter?.fullName}</strong> a unirte a la
                organización <strong>{invitation.organization?.name}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" asChild>
                <Link
                  to="."
                  search={{
                    redirect,
                  }}
                >
                  Cancelar
                </Link>
              </Button>
              <Button onClick={handleConfirm} disabled={isPending}>
                {isPending ? <Spinner /> : 'Aceptar'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <MailX />
              </EmptyMedia>
              <EmptyTitle>Invitación no encontrada</EmptyTitle>
              <EmptyDescription>
                La invitación que estás intentando aceptar no existe
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link
                  to="."
                  search={{
                    redirect,
                  }}
                >
                  Cerrar
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </DialogContent>
    </Dialog>
  )
}

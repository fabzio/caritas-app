import { env } from '@frontend/env'
import authClient from '@frontend/lib/authClient'
import { useNavigate, useSearch } from '@tanstack/react-router'
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

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function ConfirmLogout({ open, setOpen }: Readonly<Props>) {
  const navigate = useNavigate()
  const { redirect } = useSearch({
    from: '/_authenticated/settings/invitations',
  })

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: '/auth/login',
            search: {
              redirect: '/',
            },
          })
        },
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
        <DialogHeader>
          <DialogTitle>Invitación a {env.VITE_ORG_NAME}</DialogTitle>
          <DialogDescription>
            Eres parte de la organización {env.VITE_ORG_NAME}. Para tener acceso
            completo, por favor vuelve a iniciar sesión.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant="secondary">Continuar</Button>
          </DialogClose>
          <Button onClick={handleLogout}>Cerrar sesión</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

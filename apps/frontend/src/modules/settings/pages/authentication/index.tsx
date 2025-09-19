import { Separator } from '@workspace/ui/components/separator'
import ChangePassword from './components/change-password'
import LinkedAccounts from './components/linked-accounts'
import Passkeys from './components/passkeys'

export default function Authentication() {
  return (
    <>
      <h1 className="text-2xl font-medium">Contraseña</h1>
      <Separator />
      <ChangePassword />
      <h1 className="text-2xl font-medium">Cuentas Vinculadas</h1>
      <Separator />
      <LinkedAccounts />
      <h1 className="text-2xl font-medium">Llaves de Acceso</h1>
      <Separator />
      <Passkeys />
    </>
  )
}

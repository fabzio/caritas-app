import { useSearch } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { useState } from 'react'
import { useForgotPassword } from './hooks/use-forgot-password'

export default function ForgotPassword() {
  const { email: defaultEmail } = useSearch({
    from: '/auth/forgot-password',
  })
  const [email, setEmail] = useState(defaultEmail ?? '')
  const { mutate } = useForgotPassword()
  return (
    <div className="space-y-4">
      <Label>Correo electrónico</Label>
      <Input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Introduce tu correo electrónico"
        value={email}
      />
      <Button onClick={() => mutate(email)}>Enviar</Button>
    </div>
  )
}

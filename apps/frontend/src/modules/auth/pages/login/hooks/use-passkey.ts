import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const usePasskey = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const checkPasskeySupport = async () => {
      if (!PublicKeyCredential?.isConditionalMediationAvailable) {
        return
      }

      await PublicKeyCredential.isConditionalMediationAvailable()
      authClient.signIn.passkey({
        autoFill: true,
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/' })
          },
          onError: (ctx) => {
            toast.error(
              `Error al usar la llave de acceso: ${ctx.error.message}`,
            )
          },
        },
      })
    }

    checkPasskeySupport()
  }, [navigate])
  return useMutation({
    mutationFn: async () => {
      await authClient.signIn.passkey({
        autoFill: false,
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/' })
          },
          onError: (ctx) => {
            toast.error(
              `Error al usar la llave de acceso: ${ctx.error.message}`,
            )
          },
        },
      })
    },
  })
}

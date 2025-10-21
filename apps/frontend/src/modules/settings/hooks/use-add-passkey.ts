import { env } from '@frontend/env'
import { useQueryStore } from '@frontend/hooks/use-query-store'
import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UAParser } from 'ua-parser-js'

export const useAddPasskey = () => {
  const { data, setData, invalidateQuery } = useQueryStore<{
    name: string
  }>([QueryKeys.SETTINGS.PASSKEYS])
  const ua = new UAParser()
  return useMutation({
    mutationFn: async () => {
      await authClient.passkey.addPasskey({
        name: `${env.VITE_APP_TITLE} - ${ua.getOS().toString()}`,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Passkey añadida correctamente')
          },
          onError: () => {
            toast.error('Error al añadir la passkey')
          },
        },
      })
    },
    onMutate: async () => {
      setData((prev) => [
        ...prev,
        { name: `${env.VITE_APP_TITLE} - ${ua.getOS().toString()}` },
      ])
      return { data }
    },
    onError: (_, __, context) => {
      setData(() => context?.data ?? [])
    },
    onSettled: () => {
      invalidateQuery()
    },
  })
}

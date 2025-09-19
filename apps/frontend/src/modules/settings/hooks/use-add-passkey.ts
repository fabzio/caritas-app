import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UAParser } from 'ua-parser-js'
import { useQueryStore } from '@/hooks/use-query-store'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

export const useAddPasskey = () => {
  const { data, setData, invalidateQuery } = useQueryStore<{
    name: string
  }>([QueryKeys.SETTINGS.PASSKEYS])
  const ua = new UAParser()
  return useMutation({
    mutationFn: async () => {
      await authClient.passkey.addPasskey({
        name: `Cáritas Lima 365 - ${ua.getOS().toString()}`,
      })
    },
    onMutate: async () => {
      setData((prev) => [
        ...prev,
        { name: `Cáritas Lima 365 - ${ua.getOS().toString()}` },
      ])
      return { data }
    },
    onError: (_, __, context) => {
      setData(() => context?.data ?? [])
      toast.error('Error al agregar la llave de acceso')
    },
    onSuccess: () => {
      toast.success('Llave de acceso agregada con éxito')
    },
    onSettled: () => {
      invalidateQuery()
    },
  })
}

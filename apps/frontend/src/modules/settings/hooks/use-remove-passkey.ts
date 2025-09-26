import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useQueryStore } from '@/hooks/use-query-store'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

export const useRemovePasskey = () => {
  const { data, setData, cancelQuery, invalidateQuery } = useQueryStore<{
    id: string
    name: string
  }>([QueryKeys.SETTINGS.PASSKEYS])
  return useMutation({
    mutationFn: async (id: string) => {
      await authClient.passkey.deletePasskey({
        id,
      })
    },
    onMutate: async (id: string) => {
      await cancelQuery()
      setData((prev) => prev.filter((item) => item.id !== id))
      return { data }
    },
    onError: (_, __, context) => {
      setData(() => context?.data ?? [])
    },
    onSettled: () => {
      toast.success('Llave de acceso eliminada con éxito')
      invalidateQuery()
    },
  })
}

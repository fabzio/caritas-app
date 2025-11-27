import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type CreateAllyProps = {
  name: string
}
type useCreateAllyProps = {
  type: 'health' | 'education'
}
export const useCreateAlly = ({ type }: useCreateAllyProps) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: CreateAllyProps) => {
      const { data, error } = await authClient.organization.create({
        name: props.name,
        slug: props.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // quitar acentos
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-') // espacios → guiones
          .replace(/[^a-z0-9-]/g, '') // quitar símbolos
          .replace(/--+/g, '-') // evitar doble guión
          .replace(/^-+|-+$/g, ''),
        type: type,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.ALLIES],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ORGANIZATIONS],
      })
      toast.success('Organización creada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

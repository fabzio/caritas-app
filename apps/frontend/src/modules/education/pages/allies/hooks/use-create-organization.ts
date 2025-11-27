import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type CreateOrganizationProps = {
  name: string
}

export const useCreateOrganization = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: CreateOrganizationProps) => {
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
        type: 'education',
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.ORGANIZATIONS],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ORGANIZATIONS],
      })
      toast.success('Creada organización exitosamente')
      navigate({
        to: '/education/organization',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

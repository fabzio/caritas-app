import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

const usePostScholarship = () => {
  const navigate = useNavigate({ from: '/education/scholarship/form' })
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      name: string
      description: string
      requirements: string
      vacancies: number
      startDate: Date
      endDate: Date
      organizationId: string
      type: 'ML' | 'PL'
      active?: boolean
      createdBy: string
      createdAt?: Date
      updatedAt?: Date
    }) => {
      const res = await rpc.education.scholarship.post({
        ...params,
        endDate: params.endDate.toISOString(),
        startDate: params.startDate.toISOString(),
      })
      if (res.error)
        throw new Error(res.error.message || 'Error al registrar la beca')
      return res.data
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ocurrió un error al registrar la beca')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SCHOLARSHIP], // Invalida la lista (sin ID)
      })
      toast.success('Beca registrada correctamente')
      navigate({ to: '/education/scholarship' })
    },
  })
}
export default usePostScholarship

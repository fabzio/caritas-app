import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { toast } from 'sonner'

const usePostFair = () => {
  const navigate = useNavigate({ from: '/education/fair/form' })
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      title: string
      date: Date
      address: string
      startTime: string
      endTime: string
      regionId: number
      createdBy: string
      active?: boolean
      createdAt?: Date
      updatedAt?: Date
      organizations: { organizationId: string }[]
      assistanceCount?: number | null
    }) => {
      const res = await rpc.education.fairs.post({
        ...params,
        date: format(params.date, 'yyyy-MM-dd'),
      })
      if (res.error) throw res.error
      return res.data
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Ocurrió un error al registrar la feria vocacional',
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EDUCATION.FAIR] })

      toast.success('Feria vocacional registrada correctamente')
      navigate({ to: '/education/fair' })
    },
  })
}
export default usePostFair

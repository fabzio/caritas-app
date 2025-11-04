import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { toast } from 'sonner'
export const useUpdateFairs = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      id: number
      title?: string
      address?: string
      date?: Date
      startTime?: string
      endTime?: string
      regionId?: number
      active?: boolean
      createdBy?: string
      createdAt?: Date
      updatedAt?: Date
    }) => {
      const cleanBody = {
        ...params,
        date: params.date ? format(params.date, 'yyyy-MM-dd') : undefined,
      }
      const { id, ...body } = cleanBody
      const res = await rpc.education.fairs({ id: params.id }).patch(body)
      if (res.error)
        throw new Error(
          res.error.message || 'Error al registrar la feria vocacional',
        )
      return res.data
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Ocurrió un error al registrar la feria vocacional',
      )
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.FAIR],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.FAIR, variables.id],
      })

      toast.success('Feria actualizada correctamente')
      navigate({ to: '/education/fair' })
    },
  })
}

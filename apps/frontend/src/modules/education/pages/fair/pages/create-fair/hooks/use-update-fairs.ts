import rpc from '@frontend/lib/rpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const useUpdateFairs = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (params: {
      id: number
      name?: string
      description?: string
      date?: Date
      location?: string
      organizationId?: string
      active?: boolean
      createdBy?: string
      createdAt?: Date
      updatedAt?: Date
    }) => {
      const cleanBody = {
        ...params,
        date: params.date ? params.date.toISOString() : undefined,
      }
      const { id, ...body } = cleanBody
      const res = await rpc.education.fairs({ id: params.id }).patch(body)
      if (res.error) throw res.error
      return res.data
    },
    onError: () => {
      toast.error('Ocurrió un error desconocido al actualizar la feria')
    },
    onSuccess: () => {
      toast.success('Feria actualizada correctamente')
      navigate({ to: '/education/fair' })
    },
  })
}

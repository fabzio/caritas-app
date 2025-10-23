import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const useUpdateScholarship = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (params: {
      id: number
      name: string
      description: string
      requirements: string
      vacancies: number
      startDate: Date
      endDate: Date
      organizationId: string
      type: 'ML' | 'PL'
      active?: boolean
      createdBy?: string
      createdAt?: Date
      updatedAt?: Date
    }) => {
      const cleanBody = {
        ...params,
        startDate: params.startDate
          ? params.startDate.toISOString()
          : undefined,
        endDate: params.endDate ? params.endDate.toISOString() : undefined,
      }
      const { id, ...body } = cleanBody
      const res = await rpc.education.scholarship({ id: params.id }).patch(body)
      if (res.error) throw res.error
      return res.data
    },
    onError: () => {
      toast.error('Ocurrió un error desconocido al registrar la beca')
    },
    onSuccess: () => {
      toast.success('Beca registrada correctamente')
      navigate({ to: '/education/scholarship' })
    },
  })
}

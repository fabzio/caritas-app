import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type UpdateBeneficiaryProps = Parameters<
  typeof authClient.admin.updateUser
>[0] & {
  insuranceType?: 'none' | 'public' | 'private'
}

export const useUpdateBeneficiary = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: UpdateBeneficiaryProps) => {
      const { insuranceType, ...userPayload } = props
      const { data, error } = await authClient.admin.updateUser(userPayload)
      if (error) throw error
      if (insuranceType) {
        const { error: insuranceError } = await rpc.health
          .beneficiaries({ id: props.userId as string })
          .patch({ insuranceType })
        if (insuranceError) throw insuranceError
      }
      return data
    },
    onSuccess: async (_, { userId }) => {
      queryClient.removeQueries({
        queryKey: [QueryKeys.HEALTH.BENEFICIARIES],
      })
      queryClient.removeQueries({
        queryKey: [QueryKeys.HEALTH.BENEFICIARIES, userId],
      })
      toast.success('Beneficiario modificado exitosamente')
      navigate({
        to: '/health/beneficiaries',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

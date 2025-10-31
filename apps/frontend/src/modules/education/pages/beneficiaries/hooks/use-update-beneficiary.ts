import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type UpdateBeneficiaryProps = Parameters<
  typeof authClient.admin.updateUser
>[0] & {
  grade?: string
  guardianEmail?: string
}

export const useUpdateBeneficiary = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: UpdateBeneficiaryProps) => {
      const { grade, guardianEmail, ...userPayload } = props
      const { data, error } = await authClient.admin.updateUser(userPayload)
      if (error) throw error
      if (grade && guardianEmail) {
        const { error: studentError } = await rpc.education
          .beneficiaries({ id: props.userId as string })
          .patch({ grade, guardianEmail })
        if (studentError) throw studentError
      }
      return data
    },
    onSuccess: async (_, { userId }) => {
      queryClient.removeQueries({
        queryKey: [QueryKeys.EDUCATION.BENEFICIARIES],
      })
      queryClient.removeQueries({
        queryKey: [QueryKeys.EDUCATION.BENEFICIARIES, userId],
      })
      toast.success('Beneficiario modificado exitosamente')
      navigate({
        to: '/education/beneficiaries',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

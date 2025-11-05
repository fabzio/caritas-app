import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type CreateBeneficiaryProps = Parameters<
  typeof authClient.admin.createUser
>[0] & {
  grade: string
  guardianEmail: string
}

export const useCreateBeneficiary = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: CreateBeneficiaryProps) => {
      const { grade, guardianEmail, ...userPayload } = props
      const { data, error } = await authClient.admin.createUser(userPayload)
      if (error) throw error

      const userId = data.user.id
      const { error: studentError } = await rpc.auth.info.student.post({
        userId,
        grade,
        guardianEmail,
      })
      if (studentError) throw studentError
      return { userId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.BENEFICIARIES],
      })
      toast.success('Beneficiario creado exitosamente')
      navigate({
        to: '/education/beneficiaries',
      })
    },
    onError: (error: Error) => {
      const reason = error?.message ?? 'Error desconocido'
      toast.error(`Error al crear beneficiario: ${reason}`)
    },
  })
}

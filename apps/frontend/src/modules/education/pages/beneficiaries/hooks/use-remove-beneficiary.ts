import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'

interface RemoveBeneficiaryProps {
  userId: string
}

export const useRemoveBeneficiary = () => {
  return useMutation({
    mutationFn: async ({ userId }: RemoveBeneficiaryProps) => {
      const { data, error } = await rpc.education
        .beneficiaries({ id: userId })
        .delete()
      if (error) {
        throw new Error('Error desconocido al eliminar el beneficiario.')
      }
      return data
    },
  })
}

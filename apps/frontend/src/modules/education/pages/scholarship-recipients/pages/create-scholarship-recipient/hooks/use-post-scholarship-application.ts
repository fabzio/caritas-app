import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type CreateScholarshipApplicationParams = {
  scholarshipId: number
  userId: string
  comments?: string
}

export default function usePostScholarshipApplication() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (params: CreateScholarshipApplicationParams) => {
      const { data, error } =
        await rpc.education.scholarship.recipients.post(params)
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: () => {
      toast.success('Becado agregado exitosamente')
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SCHOLARSHIP_APPLICATION],
      })
      navigate({ to: '/education/recipients' })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

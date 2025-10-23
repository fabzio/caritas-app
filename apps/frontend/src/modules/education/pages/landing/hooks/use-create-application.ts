import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface CreateApplicationProps {
  scholarshipId: number
  userId: string
}

export const useCreateApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: CreateApplicationProps) => {
      const { data, error } =
        await rpc.education.scholarship.application.post(props)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_APPLICATION],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

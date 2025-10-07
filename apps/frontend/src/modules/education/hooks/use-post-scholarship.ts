import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import rpc from '@/lib/rpc'

const usePostScholarship = () => {
  const navigate = useNavigate({ from: '/education/scholarship/create' })
  return useMutation({
    mutationFn: async (params: {
      name: string
      description: string
      requirements: string
      vacancies: number | null
      startDate: Date
      endDate: Date
      organizationId: string
      type: string
      active: boolean
      createdBy: string
      createdAt?: Date
      updatedAt?: Date
    }) => {
      const res = await rpc.education.scholarship.post(params)
      if (res.error) throw res.error
      return res.data
    },
    onError: (error) => {
      console.error(error)
    },
    onSuccess: (data) => {
      navigate({ to: '/education/scholarship' })
    },
  })
}
export default usePostScholarship

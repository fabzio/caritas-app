import { useMutation } from '@tanstack/react-query'
import rpc from '@/lib/rpc'

const usePostScholarship = () => {
  return useMutation({
    mutationFn: async (params: {
      name: string
      description: string
      requirements: string
      vacancies: number
      startDate: Date
      endDate: Date
      organizationId: string
      type: string
      active: boolean
      createdBy: string
      createdAt?: Date
      updatedAt?: Date
    }) => {
      console.log(params)
      const res = await rpc.education.scholarship.post(params)
      if (res.error) throw res.error
      return res.data
    },
    onError: (error) => {
      console.error(error)
    },
    onSuccess: (data) => {
      console.log(data)
    },
  })
}
export default usePostScholarship

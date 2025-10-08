import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'

const usePostSpeciality = () => {
  return useMutation({
    mutationFn: async (params: { name: string }) => {
      const res = await rpc.health.speciality.post(params)
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

export default usePostSpeciality

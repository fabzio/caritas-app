import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

const usePostSpeciality = () => {
  const navigate = useNavigate({ from: '/health/speciality/create' })
  return useMutation({
    mutationFn: async (params: { name: string }) => {
      const res = await rpc.health.speciality.post(params)
      if (res.error) throw res.error
      return res.data
    },
    onError: (error) => {
      console.error(error)
    },
    onSuccess: (_) => {
      navigate({ to: '/health/speciality' })
    },
  })
}
export default usePostSpeciality

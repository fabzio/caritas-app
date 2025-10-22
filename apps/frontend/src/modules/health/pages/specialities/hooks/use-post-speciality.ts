import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

interface PostSpecialityProps {
  name: string
}

const usePostSpeciality = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: PostSpecialityProps) => {
      const { data, error } = await rpc.health.speciality.post(props)

      if (error) throw error
      return data
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.SPECIALITIES],
      })
      toast.success('Especialidad creada exitosamente')
      navigate({ to: '/health/specialities' })
    },
  })
}
export default usePostSpeciality

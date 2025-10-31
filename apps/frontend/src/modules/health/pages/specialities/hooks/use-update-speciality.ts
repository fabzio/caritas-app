import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

interface UpdateSpecialityProps {
  id: number
  name: string
}

export default function useUpdateSpeciality() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: UpdateSpecialityProps) => {
      const { data, error } = await rpc.health
        .speciality({
          id: props.id,
        })
        .patch({
          name: props.name,
        })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.SPECIALITIES],
      })
      toast.success('Especialidad modificada exitosamente')
    },
  })
}

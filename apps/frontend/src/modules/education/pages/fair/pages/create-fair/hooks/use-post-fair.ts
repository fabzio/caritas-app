import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

const usePostFair = () => {
  const navigate = useNavigate({ from: '/education/fair/form' })
  return useMutation({
    mutationFn: async (params: {
      title: string
      date: Date
      address: string
      startTime: string
      endTime: string
      regionId: number
      createdBy: string
      active?: boolean
      createdAt?: Date
      updatedAt?: Date
    }) => {
      const res = await rpc.education.fairs.post({
        ...params,
        date: params.date.toISOString(),
      })
      if (res.error) throw res.error
      return res.data
    },
    onError: () => {
      toast.error(
        'Ocurrió un error desconocido al registrar la feria vocacional',
      )
    },
    onSuccess: () => {
      toast.success('Feria vocacional registrada correctamente')
      navigate({ to: '/education/fair' })
    },
  })
}
export default usePostFair

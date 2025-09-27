import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export const useSetProfile = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (params: {
      profiles: string[]
      grade?: string
      schoolId?: string
      guardianEmail?: string
      insuranceType?: string
    }) => {
      console.log(params)
      navigate({ to: '/user' })
      return Promise.resolve()
    },
  })
}

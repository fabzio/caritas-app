import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import authClient from '@/lib/authClient'

export const useOneTap = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const oneTap = async () => {
      await authClient.oneTap({
        context: 'signin',
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/' })
          },
        },
      })
    }
    oneTap()
  }, [navigate])
}

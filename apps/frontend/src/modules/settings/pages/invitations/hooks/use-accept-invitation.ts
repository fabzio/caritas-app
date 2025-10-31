import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SETTINGS.INVITATIONS],
      })
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ACCESS] })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SESSION],
      })
      toast.success('Invitación aceptada correctamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al aceptar la invitación: ${error.message}`)
    },
  })
}

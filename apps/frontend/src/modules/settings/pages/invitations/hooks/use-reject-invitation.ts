import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useRejectInvitation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await authClient.organization.rejectInvitation({
        invitationId,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SETTINGS.INVITATIONS],
      })
      toast.success('Invitación rechazada correctamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al rechazar la invitación: ${error.message}`)
    },
  })
}

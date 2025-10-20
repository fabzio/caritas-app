import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useInvitation = () => {
  return useMutation({
    mutationFn: async (params: {
      email: InviteParams['email']
      roles: InviteParams['role']
    }) => {
      const { data, error } = await authClient.organization.inviteMember({
        email: params.email,
        role: params.roles,
      })
      if (error) throw error
      return data
    },
    onError: (error) => {
      toast.error(`Error al enviar la invitación: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Invitación enviada correctamente')
    },
  })
}

type InviteParams = Parameters<typeof authClient.organization.inviteMember>[0]

import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useInvitation = () => {
  return useMutation({
    mutationFn: async (params: {
      email: InviteParams['email']
      roles: InviteParams['role']
    }) => {
      const { data: dataTeams, error: listTeamsError } =
        await authClient.organization.listTeams()
      if (listTeamsError) throw listTeamsError
      const teams = dataTeams as ((typeof dataTeams)[number] & {
        role: string
      })[]

      const requestedRoles = Array.isArray(params.roles)
        ? params.roles
        : [params.roles]
      const teamIds = teams
        .filter((team) =>
          team.role
            .split(',')
            .map((r) => r.trim())
            .some((r) =>
              requestedRoles.includes(
                r as 'admin' | 'healthMember' | 'educationMember',
              ),
            ),
        )
        .map((team) => team.id)
      const { data, error } = await authClient.organization.inviteMember({
        email: params.email,
        role: params.roles,
        teamId: Array.from(new Set(teamIds)),
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

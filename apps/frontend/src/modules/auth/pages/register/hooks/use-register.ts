import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { APIError } from 'better-auth/api'
import { toast } from 'sonner'

export const useRegister = () => {
  const navigate = useNavigate({ from: '/auth/register' })
  return useMutation({
    mutationFn: async (params: {
      email: string
      password: string
      documentType: string
      documentNumber: string
      name: string
      surname: string
      birthDate: Date
      sex: string
      phone: string
      regionId: number
      token?: string
    }) => {
      const tkn = params.token
      if (!tkn) {
        throw new Error('Token de verificación es requerido')
      }
      const { data, error } = await authClient.signUp.email({
        email: params.email,
        password: params.password,
        documentType: params.documentType,
        documentNumber: params.documentNumber,
        name: params.name,
        surname: params.surname,
        birthDate: params.birthDate.toISOString(),
        phone: params.phone,
        sex: params.sex,
        regionId: params.regionId,
        fetchOptions: {
          headers: {
            'x-captcha-response': tkn,
          },
        },
      })
      if (error) throw error
      return data
    },
    onError: (error) => {
      if (error instanceof APIError) {
        toast.error(error.message)
      } else {
        toast.error(
          error.message || 'Error al registrar el usuario, intente nuevamente',
        )
      }
    },
    onSuccess: async ({ user }) => {
      toast.success('Usuario registrado correctamente')
      const setupResponse = await rpc.auth.setup.post({ id: user.id })
      if (setupResponse.status === 500) {
        toast.error('Error al verificar el usuario, intente luego')
        return
      }
      if (setupResponse.status === 401) {
        navigate({ to: '/auth/welcome' })
        return
      }
      if (!setupResponse.data) return
      try {
        await initializeOrganization(user.id)
        toast.success('Organización inicializada correctamente')
        navigate({ to: '/admin' })
      } catch (organizationError) {
        console.error('Organization initialization failed:', organizationError)
        toast.error('Error al inicializar la organización, intente luego')
      }
    },
  })
}

type OrganizationCreationResult = Awaited<
  ReturnType<typeof authClient.organization.create>
>
type OrganizationData = NonNullable<OrganizationCreationResult['data']>
type OrganizationId = OrganizationData['id']
type TeamCreationResult = Awaited<
  ReturnType<typeof authClient.organization.createTeam>
>
type TeamId = NonNullable<TeamCreationResult['data']>['id']
type AddTeamMemberInput = Parameters<
  typeof authClient.organization.addTeamMember
>[0]
type UserId = AddTeamMemberInput['userId']

const defaultTeams = ['Administración', 'Educación', 'Salud'] as const

const createOrganization = async (): Promise<OrganizationData> => {
  const { data, error } = await authClient.organization.create({
    name: 'Cáritas Lima',
    slug: 'caritas-lima',
    type: 'caritas',
  })
  if (error) throw error
  if (!data) throw new Error('No se pudo crear la organización')
  return data
}

const createDefaultTeams = async (
  organizationId: OrganizationId,
): Promise<TeamId> => {
  const responses = await Promise.all(
    defaultTeams.map((name) =>
      authClient.organization.createTeam({ name, organizationId }),
    ),
  )
  const teamError = responses.find((response) => response.error)?.error
  if (teamError) throw teamError
  const primaryTeam = responses[0]?.data
  if (!primaryTeam)
    throw new Error('No se pudo crear los equipos predeterminados')
  return primaryTeam.id
}

const addUserToPrimaryTeam = async (teamId: TeamId, userId: UserId) => {
  const { error } = await authClient.organization.addTeamMember({
    teamId,
    userId,
  })
  if (error) throw error
}

const initializeOrganization = async (userId: UserId) => {
  const organization = await createOrganization()
  const primaryTeamId = await createDefaultTeams(organization.id)
  await addUserToPrimaryTeam(primaryTeamId, userId)
}

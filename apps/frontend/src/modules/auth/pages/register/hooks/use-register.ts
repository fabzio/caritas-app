import authClient from '@frontend/lib/authClient'
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
    onSuccess: async () => {
      toast.success('Usuario registrado correctamente')
      navigate({ to: '/auth/welcome' })
    },
  })
}

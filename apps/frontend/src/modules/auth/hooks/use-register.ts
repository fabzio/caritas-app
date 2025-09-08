import { useMutation } from '@tanstack/react-query'
import authClient from '@/lib/authClient'

export const useRegister = () => {
  return useMutation({
    mutationFn: (params: {
      email: string
      password: string
      dni: string
      name: string
      surname: string
      birthDate: string
      sex: string
      phone: string
      district: string
    }) =>
      authClient.signUp.email({
        email: params.email,
        password: params.password,
        dni: params.dni,
        name: params.name,
        surname: params.surname,
        birthDate: params.birthDate,
        phone: params.phone,
        sex: params.sex,
        district: params.district,
      }),
  })
}

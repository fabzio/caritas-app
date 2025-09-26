import { z } from 'zod'

export const formUserSchema = z
  .object({
    password: z
      .string()
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
        message:
          'La contraseña debe tener al menos 8 caracteres, una letra, un número y un carácter especial',
      }),
    confirmPassword: z.string(),
    name: z.string().nonempty(),
    surname: z.string().nonempty(),
    phone: z.string().nonempty(),
    documentType: z.enum(['DNI', 'CE', 'PAS']),
    documentNumber: z.string().length(8),
    birthDate: z.date(),
    sex: z.enum(['M', 'F']),
    email: z.email(),
    regionId: z.number().min(1),
    token: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      const documentNumberLength = data.documentType === 'DNI' ? 8 : 9
      return data.documentNumber.length === documentNumberLength
    },
    {
      message: 'El número de documento no es válido',
      path: ['documentNumber'],
    },
  )

export type FormUserSchema = z.infer<typeof formUserSchema>

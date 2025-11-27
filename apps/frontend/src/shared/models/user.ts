import { z } from 'zod'

const MAX_AGE = 130
const MIN_AGE = 13
const now = new Date()
const minBirthDate = new Date(now)
minBirthDate.setFullYear(minBirthDate.getFullYear() - MAX_AGE)
const maxBirthDateForMinAge = new Date(now)
maxBirthDateForMinAge.setFullYear(maxBirthDateForMinAge.getFullYear() - MIN_AGE)

export const formUserSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/, {
        message:
          'Debe contener al menos una letra, un número y un carácter especial',
      }),
    confirmPassword: z.string(),
    name: z
      .string()
      .trim()
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
      .max(50, { message: 'El nombre no puede tener más de 50 caracteres' }),
    surname: z
      .string()
      .trim()
      .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
      .max(50, { message: 'El apellido no puede tener más de 50 caracteres' }),
    phone: z
      .string()
      .trim()
      .length(9, { message: 'El teléfono debe tener 9 dígitos' })
      .regex(/^[0-9]+$/, { message: 'El teléfono solo debe contener números' })
      .refine((val) => !/^(\d)\1*$/.test(val), {
        message: 'El teléfono no puede ser una secuencia del mismo dígito',
      }),
    documentType: z.enum(['DNI', 'CE', 'PAS'], {
      error: () => ({ message: 'Debes seleccionar un tipo de documento' }),
    }),
    documentNumber: z.string().nonempty('El número de documento es requerido'),
    birthDate: z
      .date({
        error: () => ({ message: 'Por favor, ingresa una fecha válida' }),
      })
      .max(new Date(), {
        message: 'La fecha de nacimiento no puede ser en el futuro',
      })
      .min(minBirthDate, {
        message: 'La edad no puede superar 130 años',
      })
      .refine((date) => date <= maxBirthDateForMinAge, {
        message: 'Debes tener al menos 13 años',
      }),
    sex: z.enum(['M', 'F'], {
      error: () => ({ message: 'Debes seleccionar una opción' }),
    }),
    email: z.email({ message: 'El correo electrónico no es válido' }),
    regionId: z.number().min(1, { message: 'Debes seleccionar un distrito' }),
    token: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type FormUserSchema = z.infer<typeof formUserSchema>

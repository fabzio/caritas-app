import { z } from 'zod'

export const formSpecialitySchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es obligatorio')
    .trim()
    .refine((val) => val.trim().length > 0, {
      message: 'El nombre no puede contener solo espacios',
    })
    .max(100, { message: 'El nombre no debe superar los 100 caracteres' }),
})

export type FormSpecialitySchema = z.infer<typeof formSpecialitySchema>

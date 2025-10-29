import { z } from 'zod'

export const formSpecialitySchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es obligatorio')
    .trim()
    .refine((val) => val.length > 1, {
      message: 'El nombre ndebe tener al menos 2 caracteres',
    })
    .refine((val) => !/^\d+$/.test(val), {
      message: 'El nombre no puede contener solo números',
    })
    .refine((val) => !/^[^\p{L}\p{N}]+$/u.test(val), {
      message: 'El nombre no puede contener solo símbolos',
    })
    .max(100, { message: 'El nombre no debe superar los 100 caracteres' }),
})

export type FormSpecialitySchema = z.infer<typeof formSpecialitySchema>
export type Speciality = FormSpecialitySchema & { id: number }

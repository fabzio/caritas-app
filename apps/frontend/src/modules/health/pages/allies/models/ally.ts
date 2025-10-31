import { z } from 'zod'

export const formAllySchema = z.object({
  name: z
    .string()
    .nonempty('El nombre es obligatorio')
    .trim()
    .refine((val) => val.length > 1, {
      message: 'El nombre debe tener al menos 2 caracteres',
    })
    .refine((val) => !/^\d+$/.test(val), {
      message: 'El nombre no puede contener solo números',
    })
    .refine((val) => !/^[^\p{L}\p{N}]+$/u.test(val), {
      message: 'El nombre no puede contener solo símbolos',
    })
    .max(100, { message: 'El nombre no debe superar los 100 caracteres' }),
})

export type FormAllySchema = z.infer<typeof formAllySchema>
export type Ally = FormAllySchema & { id: string }

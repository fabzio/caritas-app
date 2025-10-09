import { z } from 'zod'

export const formSpecialitySchema = z.object({
  name: z.string().nonempty('El nombre es obligatorio'),
})

export type FormSpecialitySchema = z.infer<typeof formSpecialitySchema>

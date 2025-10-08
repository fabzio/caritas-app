import { z } from 'zod'

export const formSpecialitySchema = z.object({
  name: z.string(),
})

export type FormSpecialitySchema = z.infer<typeof formSpecialitySchema>

import { z } from 'zod'

export const formAllySchema = z.object({
  name: z.string().nonempty('El nombre es obligatorio'),
})

export type FormAllySchema = z.infer<typeof formAllySchema>

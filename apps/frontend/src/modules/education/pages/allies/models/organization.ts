import { z } from 'zod'

export const formOrganizationSchema = z.object({
  name: z.string().nonempty('El nombre es obligatorio'),
})

export type FormOrganizationSchema = z.infer<typeof formOrganizationSchema>

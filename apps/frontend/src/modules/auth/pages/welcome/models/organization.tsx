import z from 'zod'

export const organizationFormSchema = z.object({
  name: z.string('Ingrese el nombre de la organización'),
})
export const organizationTypeFormSchema = z.object({
  type: z.string('Seleccione un tipo de organización'),
})

export type OrganizationForm = z.infer<typeof organizationFormSchema>
export type OrganizationTypeForm = z.infer<typeof organizationTypeFormSchema>

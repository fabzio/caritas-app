import z from 'zod'

export const personFormSchema = z.object({
  profiles: z
    .array(z.enum(['student', 'patient']))
    .min(1, 'Seleccione al menos un perfil'),
})
export const studentFormSchema = z.object({
  schoolId: z.string('Seleccione una institución educativa'),
  grade: z.string('Seleccione un grado escolar'),
  guardianEmail: z.email('Ingrese un correo válido'),
})

export const patientFormSchema = z.object({
  insuranceType: z.enum(['SIS', 'private']),
})
export type PersonForm = z.infer<typeof personFormSchema>
export type StudentForm = z.infer<typeof studentFormSchema>
export type PatientForm = z.infer<typeof patientFormSchema>

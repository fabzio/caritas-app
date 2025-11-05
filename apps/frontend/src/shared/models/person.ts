import z from 'zod'

export const personFormSchema = z.object({
  profiles: z.array(z.enum(['student', 'patient'])),
})
export const studentFormSchema = z.object({
  grade: z.string('Seleccione un grado escolar'),
  guardianEmail: z.email('Ingrese un correo válido'),
})

export const patientFormSchema = z.object({
  insuranceType: z.enum(['none', 'public', 'private']),
})
export type PersonForm = z.infer<typeof personFormSchema>
export type StudentForm = z.infer<typeof studentFormSchema>
export type PatientForm = z.infer<typeof patientFormSchema>

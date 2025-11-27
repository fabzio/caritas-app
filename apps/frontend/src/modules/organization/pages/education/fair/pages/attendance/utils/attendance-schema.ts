import { z } from 'zod'

export const attendanceSchema = z.object({
  externalAssistance: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        const num = Number(val)
        return Number.isInteger(num) && num >= 0
      },
      {
        message: 'Debe ser un número entero positivo',
      },
    ),
  fourthGradeAssistance: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        const num = Number(val)
        return Number.isInteger(num) && num >= 0
      },
      {
        message: 'Debe ser un número entero positivo',
      },
    ),
  fifthGradeAssistance: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        const num = Number(val)
        return Number.isInteger(num) && num >= 0
      },
      {
        message: 'Debe ser un número entero positivo',
      },
    ),
})

export type AttendanceSchema = z.infer<typeof attendanceSchema>

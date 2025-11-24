import { z } from 'zod'

export const attendanceSchema = z
  .object({
    assistanceCount: z
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
  .refine(
    (data) => {
      const total =
        data.assistanceCount && data.assistanceCount.trim() !== ''
          ? Number(data.assistanceCount)
          : null
      const fourth =
        data.fourthGradeAssistance && data.fourthGradeAssistance.trim() !== ''
          ? Number(data.fourthGradeAssistance)
          : 0
      const fifth =
        data.fifthGradeAssistance && data.fifthGradeAssistance.trim() !== ''
          ? Number(data.fifthGradeAssistance)
          : 0

      if (total === null) return true

      const gradeSum = fourth + fifth
      return total >= gradeSum
    },
    {
      message:
        'La asistencia total debe ser mayor o igual a la suma de asistentes de cuarto y quinto grado',
      path: ['assistanceCount'],
    },
  )

export type AttendanceSchema = z.infer<typeof attendanceSchema>

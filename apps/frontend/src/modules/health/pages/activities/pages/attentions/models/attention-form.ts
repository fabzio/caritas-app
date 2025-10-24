import { z } from 'zod'

export const formAttentionSchema = z.object({
  observations: z
    .string()
    .trim()
    .max(500, {
      message: 'Las observaciones no deben superar los 500 caracteres',
    })
    .refine((val) => val.length === 0 || val.trim().length > 0, {
      message: 'Las observaciones no pueden contener solo espacios',
    })
    .refine((val) => val.length === 0 || !/^\d+$/.test(val), {
      message: 'Las observaciones no pueden contener solo números',
    })
    .refine((val) => val.length === 0 || !/^[^\p{L}\p{N}]+$/u.test(val), {
      message: 'Las observaciones no pueden contener solo símbolos',
    })
    .optional(),
})

export type FormAttentionSchema = z.infer<typeof formAttentionSchema>

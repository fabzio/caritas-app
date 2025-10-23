import { z } from 'zod'

export const formAttentionSchema = z.object({
  observations: z
    .string()
    .trim()
    .max(500, {
      message: 'Las observaciones no deben superar los 500 caracteres',
    })
    .optional(),
})

export type FormAttentionSchema = z.infer<typeof formAttentionSchema>

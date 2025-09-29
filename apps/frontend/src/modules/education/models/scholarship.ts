import { z } from 'zod'

export const formScholarShipSchema = z.object({
  name: z.string(),
  organizationName: z.string(),
  description: z.string(),
  requirements: z.string(),
  vacanties: z.number().min(1),
  startOfDate: z.date(),
  endOfDate: z.date(),
  organizationId: z.string(),
})
export type FormScholarShipSchema = z.infer<typeof formScholarShipSchema>

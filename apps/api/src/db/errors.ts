import { createInfrastructureErrorFactory } from '@/utils/error-factory'

export const PostgresError = createInfrastructureErrorFactory(
  'PostgressError',
  500,
)

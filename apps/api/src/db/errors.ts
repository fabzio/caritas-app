import { createInfrastructureErrorFactory } from '@api/utils/error-factory'

export const PostgresError = createInfrastructureErrorFactory(
  'PostgressError',
  500,
)

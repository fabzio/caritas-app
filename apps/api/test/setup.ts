import { beforeAll } from 'bun:test'
import { pushSchema } from 'drizzle-kit/api'
import db, { schema } from '@/db'
import { auth } from '@/lib/auth'

beforeAll(async () => {
  // biome-ignore lint/suspicious/noExplicitAny: for testing only
  const { apply } = await pushSchema(schema, db as any)
  await apply()

  console.info('🧪 Setting up test user with credentials:')
  console.info('🧪 - Email: test@example.com')
  console.info('🧪 - Password: password')

  await auth.api.createUser({
    body: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
      data: {
        dni: '12345678',
        surname: 'Doe',
        sex: 'M',
        birthDate: '1990-01-01',
        phone: '+5112345678',
        district: 'Miraflores',
      },
    },
  })
})

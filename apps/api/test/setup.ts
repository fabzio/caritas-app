import { beforeAll } from 'bun:test'
import db, { schema } from '@api/db'
import { seed } from '@api/db/seed'
import { auth } from '@api/lib/auth'
import { pushSchema } from 'drizzle-kit/api'

declare global {
  var __dbInitialized: boolean | undefined
}

beforeAll(async () => {
  if (!globalThis.__dbInitialized) {
    // biome-ignore lint/suspicious/noExplicitAny: drizzle-kit types
    const { apply } = await pushSchema(schema, db as any)
    await apply()
    await seed()

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
          documentType: 'DNI',
          documentNumber: '12345678',
          surname: 'Doe',
          sex: 'M',
          birthDate: '1990-01-01',
          phone: '+5112345678',
          regionId: 1,
        },
      },
    })

    globalThis.__dbInitialized = true
  }
})

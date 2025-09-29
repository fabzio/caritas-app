import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { eq } from 'drizzle-orm'
import db, { schema } from '@/db'
import { auth } from '@/lib/auth'
import setup from '.'

const api = treaty(setup)

const findUserByEmail = async (email: string) =>
  await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.email, email),
    columns: {
      id: true,
      role: true,
    },
  })

describe('Auth Setup Module', () => {
  it('promotes the first user to admin', async () => {
    const userRecord = await findUserByEmail('test@example.com')
    expect(userRecord).toBeDefined()

    if (!userRecord) return

    await db
      .update(schema.user)
      .set({ role: null })
      .where(eq(schema.user.id, userRecord.id))

    const response = await api.setup.post({
      id: userRecord.id,
    })

    expect(response.status).toBe(200)

    const updated = await findUserByEmail('test@example.com')
    expect(updated?.role).toBe('admin')
  })

  it('rejects setup for subsequent users', async () => {
    const unique = `${Date.now()}${Math.floor(Math.random() * 1_000)}`
    const email = `user+${unique}@example.com`
    const documentNumber = unique.padEnd(12, '0').slice(0, 12)
    const phone = `+51${unique.slice(-8).padStart(8, '0')}`

    await auth.api.createUser({
      body: {
        name: 'Second User',
        email,
        password: 'password',
        role: 'user',
        data: {
          documentType: 'DNI',
          documentNumber,
          surname: 'User',
          sex: 'F',
          birthDate: '1991-01-01',
          phone,
          regionId: 1,
        },
      },
    })

    const secondUser = await findUserByEmail(email)
    expect(secondUser).toBeDefined()
    if (!secondUser) return

    await db
      .update(schema.user)
      .set({ role: 'user' })
      .where(eq(schema.user.id, secondUser.id))

    const response = await api.setup.post({
      id: secondUser.id,
    })

    expect(response.status).toBe(401)

    const persisted = await findUserByEmail(email)
    expect(persisted?.role).toBe('user')
  })
})

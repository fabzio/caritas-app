import { describe, expect, it } from 'bun:test'
import db from '@api/db'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import { info } from '..'

const api = treaty(info)

const createTestUser = async () => {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1_000)}`
  const email = `student-info+${unique}@example.com`
  const documentNumber = unique.padEnd(12, '0').slice(0, 12)
  const phone = `+51${unique.slice(-8).padStart(8, '0')}`

  await auth.api.createUser({
    body: {
      name: 'Student User',
      email,
      password: 'password',
      role: 'user',
      data: {
        documentType: 'DNI',
        documentNumber,
        surname: 'User',
        sex: 'M',
        birthDate: '1992-02-02',
        phone,
        regionId: 1,
      },
    },
  })

  const record = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.email, email),
    columns: {
      id: true,
    },
  })

  if (!record) throw new Error('User creation failed')
  return record.id
}

describe('Auth Info Student Module', () => {
  it('creates and retrieves student information', async () => {
    const userId = await createTestUser()

    const postResponse = await api.info.student.post({
      userId,
      guardianEmail: 'guardian@example.com',
      grade: 'Fifth Grade',
    })

    expect(postResponse.status).toBe(200)

    const stored = await db.query.studentInfo.findFirst({
      where: (students, { eq }) => eq(students.userId, userId),
      columns: {
        grade: true,
        guardianEmail: true,
      },
    })

    expect(stored).toMatchObject({
      grade: 'Fifth Grade',
      guardianEmail: 'guardian@example.com',
    })

    const getResponse = await api.info.student({ userId }).get()

    expect(getResponse.status).toBe(200)
    expect(getResponse.data).toMatchObject({
      userId,
      grade: 'Fifth Grade',
      guardianEmail: 'guardian@example.com',
    })
  })

  it('updates student information with patch', async () => {
    const userId = await createTestUser()

    await api.info.student.post({
      userId,
      guardianEmail: 'guardian@example.com',
      grade: 'Fifth Grade',
    })

    const patchResponse = await api.info.student({ userId }).patch({
      grade: 'Sixth Grade',
    })

    expect(patchResponse.status).toBe(200)
    expect(patchResponse.data).toMatchObject({
      grade: 'Sixth Grade',
      guardianEmail: 'guardian@example.com',
    })

    const stored = await db.query.studentInfo.findFirst({
      where: (students, { eq }) => eq(students.userId, userId),
      columns: {
        grade: true,
        guardianEmail: true,
      },
    })

    expect(stored).toMatchObject({
      grade: 'Sixth Grade',
      guardianEmail: 'guardian@example.com',
    })
  })

  it('returns 404 when student info is missing', async () => {
    const response = await api.info.student({ userId: 'missing-user' }).get()

    expect(response.status).toBe(404)
  })
})

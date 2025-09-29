import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import db from '@/db'
import { auth } from '@/lib/auth'
import { welcome } from '.'

const api = treaty(welcome)

const createTestUser = async () => {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1_000)}`
  const email = `welcome+${unique}@example.com`
  const documentNumber = unique.padEnd(12, '0').slice(0, 12)
  const phone = `+51${unique.slice(-8).padStart(8, '0')}`

  await auth.api.createUser({
    body: {
      name: 'Welcome User',
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

  expect(record).toBeDefined()
  if (!record) throw new Error('User creation failed')

  return record.id
}

describe('Auth Welcome Module', () => {
  it('persists student and patient information', async () => {
    const userId = await createTestUser()

    const response = await api.welcome.user.post({
      userId,
      studentInfo: {
        guardianEmail: 'guardian@example.com',
        grade: 'Fifth Grade',
      },
      patientInfo: {
        insuranceType: 'public',
      },
    })

    expect(response.status).toBe(200)

    const studentRecord = await db.query.studentInfo.findFirst({
      where: (students, { eq }) => eq(students.userId, userId),
      columns: {
        guardianEmail: true,
        grade: true,
      },
    })

    expect(studentRecord).toMatchObject({
      guardianEmail: 'guardian@example.com',
      grade: 'Fifth Grade',
    })

    const patientRecord = await db.query.patientInfo.findFirst({
      where: (patients, { eq }) => eq(patients.userId, userId),
      columns: {
        insuranceType: true,
      },
    })

    expect(patientRecord?.insuranceType).toBe('public')
  })

  it('accepts partial payloads without creating missing sections', async () => {
    const userId = await createTestUser()

    const response = await api.welcome.user.post({
      userId,
      studentInfo: {
        guardianEmail: 'guardian2@example.com',
        grade: 'Fourth Grade',
      },
    })

    expect(response.status).toBe(200)

    const studentRecord = await db.query.studentInfo.findFirst({
      where: (students, { eq }) => eq(students.userId, userId),
      columns: {
        guardianEmail: true,
        grade: true,
      },
    })

    expect(studentRecord).toMatchObject({
      guardianEmail: 'guardian2@example.com',
      grade: 'Fourth Grade',
    })

    const patientRecord = await db.query.patientInfo.findFirst({
      where: (patients, { eq }) => eq(patients.userId, userId),
      columns: {
        insuranceType: true,
      },
    })

    expect(patientRecord).toBeUndefined()
  })
})

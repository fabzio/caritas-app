import { describe, expect, it } from 'bun:test'
import db from '@api/db'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import { info } from '..'

const api = treaty(info)

const createTestUser = async () => {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1_000)}`
  const email = `patient-info+${unique}@example.com`
  const documentNumber = unique.padEnd(12, '0').slice(0, 12)
  const phone = `+51${unique.slice(-8).padStart(8, '0')}`

  await auth.api.createUser({
    body: {
      name: 'Patient User',
      email,
      password: 'password',
      role: 'user',
      data: {
        documentType: 'DNI',
        documentNumber,
        surname: 'User',
        sex: 'F',
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

describe('Auth Info Patient Module', () => {
  it('creates and retrieves patient information', async () => {
    const userId = await createTestUser()

    const postResponse = await api.info.patient.post({
      userId,
      insuranceType: 'public',
    })

    expect(postResponse.status).toBe(200)

    const stored = await db.query.patientInfo.findFirst({
      where: (patients, { eq }) => eq(patients.userId, userId),
      columns: {
        insuranceType: true,
      },
    })

    expect(stored?.insuranceType).toBe('public')

    const getResponse = await api.info.patient({ userId }).get()

    expect(getResponse.status).toBe(200)
    expect(getResponse.data).toMatchObject({
      userId,
      insuranceType: 'public',
    })
  })

  it('updates patient information with patch', async () => {
    const userId = await createTestUser()

    await api.info.patient.post({
      userId,
      insuranceType: 'public',
    })

    const patchResponse = await api.info.patient({ userId }).patch({
      insuranceType: 'private',
    })

    expect(patchResponse.status).toBe(200)
    expect(patchResponse.data).toMatchObject({
      userId,
      insuranceType: 'private',
    })

    const stored = await db.query.patientInfo.findFirst({
      where: (patients, { eq }) => eq(patients.userId, userId),
      columns: {
        insuranceType: true,
      },
    })

    expect(stored?.insuranceType).toBe('private')
  })

  it('returns 404 when patient info is missing', async () => {
    const response = await api.info.patient({ userId: 'missing-user' }).get()

    expect(response.status).toBe(404)
  })
})

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test'
import db, { schema } from '@api/db'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import { eq } from 'drizzle-orm'
import scholarship from '.'

type OwnerContext = {
  cookie: string
  organizationId: string
  organizationSlug: string
  ownerUserId: string
}

const api = treaty(scholarship)

const buildNumericSequence = () =>
  `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`

const buildDocumentNumber = (value: string, length: number) =>
  value.padEnd(length, '0').slice(0, length)

const buildPhone = (value: string) => `+51${value.slice(-9).padStart(9, '0')}`

const createOwnerContext = async (): Promise<OwnerContext> => {
  const sequence = buildNumericSequence()
  const email = `owner+${sequence}@example.com`
  const password = 'password'
  const createUserResponse = await auth.api.createUser({
    body: {
      name: `Owner ${sequence}`,
      email,
      password,
      role: 'admin',
      data: {
        documentType: 'DNI',
        documentNumber: buildDocumentNumber(sequence, 12),
        surname: 'Owner',
        sex: 'M',
        birthDate: '1990-01-01',
        phone: buildPhone(sequence),
        regionId: 1,
      },
    },
  })
  const ownerUserId =
    (createUserResponse.user as unknown as { id?: string; userId?: string })
      .id ??
    (createUserResponse.user as unknown as { id?: string; userId?: string })
      .userId
  if (!ownerUserId) throw new Error('Failed to get created user id')

  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: {
      email,
      password,
    },
  })
  const cookie = headers.get('set-cookie')
  if (!cookie) throw new Error('Missing authentication cookie')

  const organizationSlug = `test-organization-${sequence}`
  const organization = await auth.api.createOrganization({
    headers: { cookie },
    body: {
      name: `Test Organization ${sequence}`,
      slug: organizationSlug,
      type: 'education',
      logo: 'https://example.com/logo.png',
    } as unknown as Record<string, unknown>,
  })
  if (!organization) throw new Error('Failed to create test organization')

  await auth.api.setActiveOrganization({
    headers: { cookie },
    body: {
      organizationId: organization.id,
    },
  })

  return {
    cookie,
    organizationId: organization.id,
    organizationSlug,
    ownerUserId,
  }
}

const removeScholarships = async (ids: number[]) => {
  if (ids.length === 0) return
  await db.delete(schema.scholarship).where(eq(schema.scholarship.id, ids[0]))
  if (ids.length === 1) return
  for (let index = 1; index < ids.length; index += 1)
    await db
      .delete(schema.scholarship)
      .where(eq(schema.scholarship.id, ids[index]))
}

let ownerContext: OwnerContext
const stagedScholarshipIds: number[] = []

beforeAll(async () => {
  ownerContext = await createOwnerContext()
})

afterEach(async () => {
  await removeScholarships(stagedScholarshipIds.splice(0))
})

afterAll(async () => {
  if (!ownerContext) return
  await db
    .delete(schema.organization)
    .where(eq(schema.organization.id, ownerContext.organizationId))
  await db
    .delete(schema.user)
    .where(eq(schema.user.id, ownerContext.ownerUserId))
})

describe('Scholarship Module', () => {
  it('creates a new scholarship', async () => {
    const response = await api.scholarship.post(
      {
        name: 'Test Scholarship',
        description: 'Test scholarship description',
        requirements: 'Test requirements',
        type: 'ML' as const,
        vacancies: 10,
        startDate: new Date('2025-01-01').toISOString(),
        endDate: new Date('2025-12-31').toISOString(),
        organizationId: ownerContext.organizationId,
        createdBy: ownerContext.ownerUserId,
        active: true,
      },
      { headers: { cookie: ownerContext.cookie } },
    )

    expect(response.status).toBe(200)
    expect(response.data).toBeNumber()

    if (typeof response.data === 'number') {
      stagedScholarshipIds.push(response.data)
    }
  })

  it('returns a list of scholarships', async () => {
    const createResponse = await api.scholarship.post(
      {
        name: 'Scholarship for Listing',
        description: 'Description for listing',
        requirements: 'Requirements for listing',
        type: 'PL' as const,
        vacancies: 5,
        startDate: new Date('2025-02-01').toISOString(),
        endDate: new Date('2025-11-30').toISOString(),
        organizationId: ownerContext.organizationId,
        createdBy: ownerContext.ownerUserId,
        active: true,
      },
      { headers: { cookie: ownerContext.cookie } },
    )

    if (typeof createResponse.data === 'number') {
      stagedScholarshipIds.push(createResponse.data)
    }

    const response = await api.scholarship.get({
      headers: { cookie: ownerContext.cookie },
    })

    expect(response.status).toBe(200)
    expect(response.data).toBeObject()
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.data.length).toBeGreaterThan(0)
    expect(response.data?.total).toBeGreaterThan(0)

    const scholarshipNames = response.data?.data.map((s) => s.name) || []
    expect(scholarshipNames).toContain('Scholarship for Listing')
  })

  it('creates scholarship with modular type', async () => {
    const response = await api.scholarship.post(
      {
        name: 'Modular Scholarship',
        description: 'Modular type scholarship',
        requirements: 'Modular requirements',
        type: 'ML' as const,
        vacancies: 15,
        startDate: new Date('2025-03-01').toISOString(),
        endDate: new Date('2025-10-31').toISOString(),
        organizationId: ownerContext.organizationId,
        createdBy: ownerContext.ownerUserId,
        active: true,
      },
      { headers: { cookie: ownerContext.cookie } },
    )

    expect(response.status).toBe(200)
    expect(response.data).toBeNumber()

    if (typeof response.data === 'number') {
      stagedScholarshipIds.push(response.data)
    }
  })

  it('creates scholarship with plan type', async () => {
    const response = await api.scholarship.post(
      {
        name: 'Plan Scholarship',
        description: 'Plan type scholarship',
        requirements: 'Plan requirements',
        type: 'PL' as const,
        vacancies: 20,
        startDate: new Date('2025-04-01').toISOString(),
        endDate: new Date('2025-09-30').toISOString(),
        organizationId: ownerContext.organizationId,
        createdBy: ownerContext.ownerUserId,
        active: true,
      },
      { headers: { cookie: ownerContext.cookie } },
    )

    expect(response.status).toBe(200)
    expect(response.data).toBeNumber()

    if (typeof response.data === 'number') {
      stagedScholarshipIds.push(response.data)
    }
  })
})

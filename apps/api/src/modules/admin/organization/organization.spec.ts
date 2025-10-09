import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test'
import db, { schema } from '@api/db'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import { eq } from 'drizzle-orm'
import organization from '.'

type OwnerContext = {
  cookie: string
  ownerUserId: string
}

const api = treaty(organization)

const buildNumericSequence = () =>
  `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`

const buildDocumentNumber = (value: string, length: number) =>
  value.padEnd(length, '0').slice(0, length)

const buildPhone = (value: string) => `+51${value.slice(-9).padStart(9, '0')}`

const createOwnerContext = async (): Promise<OwnerContext> => {
  const sequence = buildNumericSequence()
  const email = `owner+${sequence}@example.com`
  const password = 'password'
  const {
    user: { id: ownerUserId },
  } = await auth.api.createUser({
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

  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: {
      email,
      password,
    },
  })
  const cookie = headers.get('set-cookie')
  if (!cookie) throw new Error('Missing authentication cookie')

  return {
    cookie,
    ownerUserId,
  }
}

const removeOrganizations = async (ids: string[]) => {
  if (ids.length === 0) return
  await db.delete(schema.organization).where(eq(schema.organization.id, ids[0]))
  if (ids.length === 1) return
  for (let index = 1; index < ids.length; index += 1)
    await db
      .delete(schema.organization)
      .where(eq(schema.organization.id, ids[index]))
}

let ownerContext: OwnerContext
const stagedOrganizationIds: string[] = []

beforeAll(async () => {
  ownerContext = await createOwnerContext()
})

afterEach(async () => {
  await removeOrganizations(stagedOrganizationIds.splice(0))
})

afterAll(async () => {
  await db
    .delete(schema.user)
    .where(eq(schema.user.id, ownerContext.ownerUserId))
})

describe('Organization Module', () => {
  it('creates a new organization', async () => {
    const response = await api.organization.post(
      {
        name: 'Test Health Organization',
        type: 'health',
        logo: 'https://example.com/logo.png',
      },
      { headers: { cookie: ownerContext.cookie } },
    )

    expect(response.status).toBe(200)
    expect(typeof response.data).toBe('string')

    if (typeof response.data === 'string') {
      stagedOrganizationIds.push(response.data)
    }
  })

  it('returns a list of organizations', async () => {
    const createResponse = await api.organization.post(
      {
        name: 'Organization for Listing',
        type: 'education',
        logo: 'https://example.com/education-logo.png',
      },
      { headers: { cookie: ownerContext.cookie } },
    )

    if (typeof createResponse.data === 'string') {
      stagedOrganizationIds.push(createResponse.data)
    }

    const response = await api.organization.get({
      headers: { cookie: ownerContext.cookie },
      query: { page: 0, limit: 10 },
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.total).toBeGreaterThan(0)

    const organizationNames = response.data?.data.map((org) => org.name) || []
    expect(organizationNames).toContain('Organization for Listing')
  })

  it('returns a single organization', async () => {
    const createResponse = await api.organization.post(
      {
        name: 'Single Organization Test',
        type: 'caritas',
        logo: 'https://example.com/caritas-logo.png',
      },
      { headers: { cookie: ownerContext.cookie } },
    )

    expect(typeof createResponse.data).toBe('string')

    if (typeof createResponse.data === 'string') {
      stagedOrganizationIds.push(createResponse.data)

      const response = await api.organization({ id: createResponse.data }).get({
        headers: { cookie: ownerContext.cookie },
      })

      expect(response.status).toBe(200)
      expect(response.data?.id).toBe(createResponse.data)
      expect(response.data?.name).toBe('Single Organization Test')
      expect(response.data?.type).toBe('caritas')
    }
  })

  it('creates organization with different types', async () => {
    const types = ['caritas', 'education', 'health', 'beneficiary'] as const

    for (const type of types) {
      const response = await api.organization.post(
        {
          name: `${type} Organization`,
          type: type,
          logo: `https://example.com/${type}-logo.png`,
        },
        { headers: { cookie: ownerContext.cookie } },
      )

      expect(response.status).toBe(200)
      expect(typeof response.data).toBe('string')

      if (typeof response.data === 'string') {
        stagedOrganizationIds.push(response.data)
      }
    }
  })

  it('filters organizations by search query', async () => {
    const createResponse1 = await api.organization.post(
      {
        name: 'Unique Search Test Org',
        type: 'health',
        logo: 'https://example.com/unique-logo.png',
      },
      { headers: { cookie: ownerContext.cookie } },
    )

    if (typeof createResponse1.data === 'string') {
      stagedOrganizationIds.push(createResponse1.data)
    }

    const response = await api.organization.get({
      headers: { cookie: ownerContext.cookie },
      query: { q: 'Unique Search', page: 0, limit: 10 },
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)

    const organizationNames = response.data?.data.map((org) => org.name) || []
    expect(organizationNames).toContain('Unique Search Test Org')
  })
})

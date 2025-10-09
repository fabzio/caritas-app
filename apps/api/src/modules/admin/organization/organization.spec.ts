import { afterEach, beforeAll, describe, expect, it } from 'bun:test'
import db, { schema } from '@api/db'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import { eq } from 'drizzle-orm'
import organization from '.'

type TestUserContext = {
  cookie: string
}

const api = treaty(organization)

const buildNumericSequence = () =>
  `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`

const getTestUserContext = async (): Promise<TestUserContext> => {
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: {
      email: 'test@example.com',
      password: 'password',
    },
  })
  const cookie = headers.get('set-cookie')
  if (!cookie) throw new Error('Missing authentication cookie')
  return { cookie }
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

let ownerContext: TestUserContext
const stagedOrganizationIds: string[] = []

beforeAll(async () => {
  ownerContext = await getTestUserContext()
})

afterEach(async () => {
  await removeOrganizations(stagedOrganizationIds.splice(0))
})

describe('Organization Module', () => {
  it('creates a new organization', async () => {
    const slug = `test-health-org-${buildNumericSequence()}`
    const response = await auth.api.createOrganization({
      body: {
        name: 'Test Health Organization',
        slug,
        type: 'health',
        logo: 'https://example.com/logo.png',
      },
      headers: { cookie: ownerContext.cookie },
    })

    await auth.api.setActiveOrganization({
      body: { organizationId: response?.id || '' },
      headers: { cookie: ownerContext.cookie },
    })

    expect(response).toBeTruthy()
    if (response) {
      expect(typeof response.id).toBe('string')
      expect(response.name).toBe('Test Health Organization')
      expect(response.slug).toBe(slug)
      expect(response.type).toBe('health')
      stagedOrganizationIds.push(response.id)
    }
  })

  it('returns a list of organizations', async () => {
    const slug = `organization-for-listing-${buildNumericSequence()}`
    const createResponse = await auth.api.createOrganization({
      body: {
        name: 'Organization for Listing',
        slug,
        type: 'education',
        logo: 'https://example.com/education-logo.png',
      },
      headers: { cookie: ownerContext.cookie },
    })

    if (createResponse) {
      stagedOrganizationIds.push(createResponse.id)
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
    const slug = `single-organization-test-${buildNumericSequence()}`
    const createResponse = await auth.api.createOrganization({
      body: {
        name: 'Single Organization Test',
        slug,
        type: 'caritas',
        logo: 'https://example.com/caritas-logo.png',
      },
      headers: { cookie: ownerContext.cookie },
    })

    expect(createResponse).toBeTruthy()

    if (createResponse) {
      stagedOrganizationIds.push(createResponse.id)

      const response = await api.organization({ id: createResponse.id }).get({
        headers: { cookie: ownerContext.cookie },
      })

      expect(response.status).toBe(200)
      expect(response.data?.id).toBe(createResponse.id)
      expect(response.data?.name).toBe('Single Organization Test')
      expect(response.data?.type).toBe('caritas')
    }
  })

  it('creates organization with different types', async () => {
    const types = ['caritas', 'education', 'health', 'beneficiary'] as const

    for (const type of types) {
      const slug = `${type}-organization-${buildNumericSequence()}`
      const response = await auth.api.createOrganization({
        body: {
          name: `${type} Organization`,
          slug,
          type,
          logo: `https://example.com/${type}-logo.png`,
        },
        headers: { cookie: ownerContext.cookie },
      })

      expect(response).toBeTruthy()

      if (response) {
        stagedOrganizationIds.push(response.id)
      }
    }
  })

  it('filters organizations by search query', async () => {
    const slug = `unique-search-test-org-${buildNumericSequence()}`
    const createResponse = await auth.api.createOrganization({
      body: {
        name: 'Unique Search Test Org',
        slug,
        type: 'health',
        logo: 'https://example.com/unique-logo.png',
      },
      headers: { cookie: ownerContext.cookie },
    })

    if (createResponse) {
      stagedOrganizationIds.push(createResponse.id)
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

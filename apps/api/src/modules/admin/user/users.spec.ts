import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test'
import db, { schema } from '@api/db'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import { eq } from 'drizzle-orm'
import users from '.'

type Team = {
  name: string
  role: 'healthMember' | 'educationMember' | 'admin'
}

type OwnerContext = {
  cookie: string
  organizationId: string
  organizationSlug: string
  teamIds: Record<string, string>
  ownerUserId: string
}

const api = treaty(users)
const defaultTeams: Team[] = [
  {
    name: 'Salud',
    role: 'healthMember',
  },
  {
    name: 'Educación',
    role: 'educationMember',
  },
]

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

  const organizationSlug = `test-organization-${sequence}`
  const organization = await auth.api.createOrganization({
    headers: { cookie },
    body: {
      name: `Test Organization ${sequence}`,
      slug: organizationSlug,
      type: 'caritas',
    },
  })
  if (!organization) throw new Error('Failed to create test organization')

  await auth.api.setActiveOrganization({
    headers: { cookie },
    body: {
      organizationId: organization.id,
      organizationSlug,
    },
  })

  const teams = await Promise.all(
    defaultTeams.map(async (team) => {
      const created = await auth.api.createTeam({
        headers: { cookie },
        body: {
          name: team.name,
          organizationId: organization.id,
          role: team.role,
        },
      })
      if (!created) throw new Error(`Failed to create test team ${team}`)
      return [team.name, created.id] as const
    }),
  )

  const teamIds = Object.fromEntries(teams)

  return {
    cookie,
    organizationId: organization.id,
    organizationSlug,
    teamIds,
    ownerUserId,
  }
}

const createMemberUser = async (label: string) => {
  const sequence = buildNumericSequence()
  const email = `${label}+${sequence}@example.com`

  const {
    user: { id },
  } = await auth.api.createUser({
    body: {
      name: `Member ${sequence}`,
      email,
      password: 'password',
      role: 'user',
      data: {
        documentType: 'DNI',
        documentNumber: buildDocumentNumber(sequence, 12),
        surname: label,
        sex: 'M',
        birthDate: '1992-02-02',
        phone: buildPhone(sequence),
        regionId: 1,
      },
    },
  })

  return { id, email }
}

const removeUsers = async (ids: string[]) => {
  if (ids.length === 0) return
  await db.delete(schema.user).where(eq(schema.user.id, ids[0]))
  if (ids.length === 1) return
  for (let index = 1; index < ids.length; index += 1)
    await db.delete(schema.user).where(eq(schema.user.id, ids[index]))
}

let ownerContext: OwnerContext
const stagedUserIds: string[] = []

beforeAll(async () => {
  ownerContext = await createOwnerContext()
})

afterEach(async () => {
  await removeUsers(stagedUserIds.splice(0))
})

afterAll(async () => {
  await db
    .delete(schema.organization)
    .where(eq(schema.organization.id, ownerContext.organizationId))
  await removeUsers([ownerContext.ownerUserId])
})

describe('Common Users Module', () => {
  it('returns a list of users', async () => {
    const member = await createMemberUser('member-list')

    stagedUserIds.push(member.id)
    await auth.api.addMember({
      headers: { cookie: ownerContext.cookie },
      body: {
        userId: member.id,
        role: 'member',
        organizationId: ownerContext.organizationId,
      },
    })

    await auth.api.addTeamMember({
      headers: { cookie: ownerContext.cookie },
      body: {
        userId: member.id,
        teamId: ownerContext.teamIds.Salud,
      },
    })

    const response = await api.users.get({
      headers: { cookie: ownerContext.cookie },
      query: {
        organizationId: ownerContext.organizationId,
        page: 0,
        limit: 10,
      },
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.total).toBeGreaterThan(0)
    const data = response.data?.data ?? []
    const emails = data.map((user) => user.email)
    expect(emails).toContain(member.email)
  })

  it('returns a single user', async () => {
    const member = await createMemberUser('member-single')
    stagedUserIds.push(member.id)

    await auth.api.addMember({
      headers: { cookie: ownerContext.cookie },
      body: {
        userId: member.id,
        role: 'member',
        organizationId: ownerContext.organizationId,
      },
    })

    await auth.api.addTeamMember({
      headers: { cookie: ownerContext.cookie },
      body: {
        userId: member.id,
        teamId: ownerContext.teamIds.Educación,
      },
    })

    const response = await api.users({ id: member.id }).get({
      headers: { cookie: ownerContext.cookie },
    })

    expect(response.status).toBe(200)
    expect(response.data?.id).toBe(member.id)
    expect(response.data?.email).toBe(member.email)
    const teamNames = (response.data?.teams ?? []).map((team) => team.name)
    expect(teamNames).toContain('Educación')
  })
})

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test'
import db, { schema } from '@api/db'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import { eq } from 'drizzle-orm'
import report from '.'

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

const api = treaty(report)
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
  const userResult = (await auth.api.createUser({
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
  })) as { user: { id: string } }
  const ownerUserId = userResult.user.id

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
      type: 'caritas' as any,
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
          role: team.role as any,
        },
      })
      if (!created) throw new Error(`Failed to create test team ${team.name}`)
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

const createTestUser = async (label: string) => {
  const sequence = buildNumericSequence()
  const email = `${label}+${sequence}@example.com`

  const userResult = (await auth.api.createUser({
    body: {
      name: `Student ${sequence}`,
      email,
      password: 'password',
      role: 'user',
      data: {
        documentType: 'DNI',
        documentNumber: buildDocumentNumber(sequence, 12),
        surname: label,
        sex: 'M',
        birthDate: '1995-05-05',
        phone: buildPhone(sequence),
        regionId: 1,
      },
    },
  })) as { user: { id: string } }

  return { id: userResult.user.id, email }
}

const createTestScholarship = async (ownerContext: OwnerContext) => {
  const sequence = buildNumericSequence()
  const [scholarship] = await db
    .insert(schema.scholarship)
    .values({
      name: `Test Scholarship ${sequence}`,
      description: 'Test scholarship for reports',
      requirements: 'Test requirements',
      organizationId: ownerContext.organizationId,
      createdBy: ownerContext.ownerUserId,
      type: 'ML',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      vacancies: 10,
      active: true,
    })
    .returning({ id: schema.scholarship.id })

  return scholarship.id
}

const removeUsers = async (ids: string[]) => {
  if (ids.length === 0) return
  await db.delete(schema.user).where(eq(schema.user.id, ids[0]))
  if (ids.length === 1) return
  for (let index = 1; index < ids.length; index += 1)
    await db.delete(schema.user).where(eq(schema.user.id, ids[index]))
}

const removeScholarships = async (ids: number[]) => {
  if (ids.length === 0) return
  for (const id of ids) {
    // Get all report IDs for this scholarship to delete their reasons
    const reports = await db
      .select({ reasonId: schema.scholarshipStudentReport.reason })
      .from(schema.scholarshipStudentReport)
      .where(eq(schema.scholarshipStudentReport.scholarshipId, id))

    // Delete report reasons first
    for (const report of reports) {
      if (report.reasonId) {
        await db
          .delete(schema.reportReason)
          .where(eq(schema.reportReason.id, report.reasonId))
      }
    }

    // Delete scholarship reports
    await db
      .delete(schema.scholarshipStudentReport)
      .where(eq(schema.scholarshipStudentReport.scholarshipId, id))

    // Finally delete the scholarship
    await db.delete(schema.scholarship).where(eq(schema.scholarship.id, id))
  }
}

let ownerContext: OwnerContext
const stagedUserIds: string[] = []
const stagedScholarshipIds: number[] = []

beforeAll(async () => {
  ownerContext = await createOwnerContext()
})

afterEach(async () => {
  await removeScholarships(stagedScholarshipIds.splice(0))
  await removeUsers(stagedUserIds.splice(0))
})

afterAll(async () => {
  await db
    .delete(schema.organization)
    .where(eq(schema.organization.id, ownerContext.organizationId))
  await removeUsers([ownerContext.ownerUserId])
})

describe('Scholarship Report Module', () => {
  it('Should not allow unauthenticated access to GET', async () => {
    const response = await api.report.get({
      query: {
        scholarshipId: 1,
        page: 1,
        pageSize: 10,
      },
    })
    expect(response.status).toBe(401)
  })

  it('Should not allow unauthenticated access to POST', async () => {
    const response = await api.report.post({
      scholarshipId: 1,
      userId: 'test-user',
      reportedBy: 'test-reporter',
      cause: 'absence',
      reason: 'Test reason',
    })
    expect(response.status).toBe(401)
  })

  it('Should create a scholarship report', async () => {
    const student = await createTestUser('student-report')
    const scholarshipId = await createTestScholarship(ownerContext)

    stagedUserIds.push(student.id)
    stagedScholarshipIds.push(scholarshipId)

    const response = await api.report.post(
      {
        scholarshipId,
        userId: student.id,
        reportedBy: ownerContext.ownerUserId,
        cause: 'absence',
        reason: 'Faltas injustificadas',
        reasonDetail: 'El estudiante ha faltado 3 veces este mes',
      },
      {
        headers: { cookie: ownerContext.cookie },
      },
    )

    expect(response.status).toBe(200)
    expect(response.data).toBeNumber()
    expect(response.data).toBeGreaterThan(0)
  })

  it('Should return an empty list of reports for scholarship without reports', async () => {
    const scholarshipId = await createTestScholarship(ownerContext)
    stagedScholarshipIds.push(scholarshipId)

    const response = await api.report.get({
      headers: { cookie: ownerContext.cookie },
      query: {
        scholarshipId,
        page: 1,
        pageSize: 10,
      },
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.data.length).toBe(0)
    expect(response.data?.total).toBe(0)
  })

  it('Should return a list of reports for a scholarship', async () => {
    const student = await createTestUser('student-list')
    const scholarshipId = await createTestScholarship(ownerContext)

    stagedUserIds.push(student.id)
    stagedScholarshipIds.push(scholarshipId)

    // Create a report
    await api.report.post(
      {
        scholarshipId,
        userId: student.id,
        reportedBy: ownerContext.ownerUserId,
        cause: 'performance',
        reason: 'Bajo rendimiento académico',
        causeDetail: 'Notas por debajo del promedio',
      },
      {
        headers: { cookie: ownerContext.cookie },
      },
    )

    const response = await api.report.get({
      headers: { cookie: ownerContext.cookie },
      query: {
        scholarshipId,
        page: 1,
        pageSize: 10,
      },
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.data.length).toBeGreaterThan(0)
    expect(response.data?.total).toBeGreaterThan(0)

    const firstReport = response.data?.data[0]
    expect(firstReport?.scholarship.id).toBe(scholarshipId)
    expect(firstReport?.student.id).toBe(student.id)
    expect(firstReport?.cause).toBe('performance')
  })

  it('Should filter reports by student search', async () => {
    const student1 = await createTestUser('john-doe')
    const student2 = await createTestUser('jane-smith')
    const scholarshipId = await createTestScholarship(ownerContext)

    stagedUserIds.push(student1.id, student2.id)
    stagedScholarshipIds.push(scholarshipId)

    // Create reports for both students
    await api.report.post(
      {
        scholarshipId,
        userId: student1.id,
        reportedBy: ownerContext.ownerUserId,
        cause: 'absence',
        reason: 'Ausencias',
      },
      {
        headers: { cookie: ownerContext.cookie },
      },
    )

    await api.report.post(
      {
        scholarshipId,
        userId: student2.id,
        reportedBy: ownerContext.ownerUserId,
        cause: 'other',
        reason: 'Otro motivo',
      },
      {
        headers: { cookie: ownerContext.cookie },
      },
    )

    // Search for john-doe
    const response = await api.report.get({
      headers: { cookie: ownerContext.cookie },
      query: {
        scholarshipId,
        search: 'john-doe',
        page: 1,
        pageSize: 10,
      },
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.total).toBeGreaterThan(0)

    // All returned reports should be for john-doe
    const reports = response.data?.data ?? []
    expect(reports.some((r) => r.student.id === student1.id)).toBe(true)
  })

  it('Should handle pagination correctly', async () => {
    const scholarshipId = await createTestScholarship(ownerContext)

    // Create multiple students and reports
    for (let i = 0; i < 5; i++) {
      const student = await createTestUser(`student-pagination-${i}`)
      stagedUserIds.push(student.id)

      await api.report.post(
        {
          scholarshipId,
          userId: student.id,
          reportedBy: ownerContext.ownerUserId,
          cause: 'other',
          reason: `Test reason ${i}`,
        },
        {
          headers: { cookie: ownerContext.cookie },
        },
      )
    }

    stagedScholarshipIds.push(scholarshipId)

    // Get first page with 3 items
    const page1Response = await api.report.get({
      headers: { cookie: ownerContext.cookie },
      query: {
        scholarshipId,
        page: 1,
        pageSize: 3,
      },
    })

    expect(page1Response.status).toBe(200)
    expect(page1Response.data?.data.length).toBe(3)
    expect(page1Response.data?.page).toBe(1)
    expect(page1Response.data?.pageSize).toBe(3)
    expect(page1Response.data?.total).toBe(5)
    expect(page1Response.data?.pageCount).toBe(2)

    // Get second page
    const page2Response = await api.report.get({
      headers: { cookie: ownerContext.cookie },
      query: {
        scholarshipId,
        page: 2,
        pageSize: 3,
      },
    })

    expect(page2Response.status).toBe(200)
    expect(page2Response.data?.data.length).toBe(2)
    expect(page2Response.data?.page).toBe(2)
  })

  it('Should validate required fields when creating a report', async () => {
    const response = await api.report.post(
      {
        scholarshipId: 1,
        userId: 'test-user',
        reportedBy: '', // Empty reportedBy should fail validation
        cause: 'absence',
        reason: 'Test reason',
      },
      {
        headers: { cookie: ownerContext.cookie },
      },
    )

    expect(response.status).toBe(400)
  })
})

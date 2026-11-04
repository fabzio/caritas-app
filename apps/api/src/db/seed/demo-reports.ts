import db, { schema } from '@api/db'
import { fakerES as faker } from '@faker-js/faker'
import { and, eq, inArray, like } from 'drizzle-orm'

const seedMissingDemoReports = async () => {
  const result = await db.transaction(async (tx) => {
    const demoScholarships = await tx
      .select({ id: schema.scholarship.id })
      .from(schema.scholarship)
      .innerJoin(
        schema.organization,
        eq(schema.scholarship.organizationId, schema.organization.id),
      )
      .where(like(schema.organization.slug, 'demo-education-%'))

    if (demoScholarships.length === 0)
      throw new Error('No demo scholarships were found in the database.')

    const scholarshipIds = demoScholarships.map((scholarship) => scholarship.id)
    const existingReports = await tx
      .select({ scholarshipId: schema.scholarshipStudentReport.scholarshipId })
      .from(schema.scholarshipStudentReport)
      .where(
        inArray(schema.scholarshipStudentReport.scholarshipId, scholarshipIds),
      )
    const reportedScholarshipIds = new Set(
      existingReports.map((report) => report.scholarshipId),
    )
    const missingScholarshipIds = scholarshipIds.filter(
      (scholarshipId) => !reportedScholarshipIds.has(scholarshipId),
    )

    if (missingScholarshipIds.length === 0) return []

    const [admin] = await tx
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.role, 'admin'))
      .limit(1)
    if (!admin) throw new Error('A system administrator is required.')

    const acceptedApplications = await tx
      .select({
        scholarshipId: schema.scholarshipApplication.scholarshipId,
        userId: schema.scholarshipApplication.userId,
      })
      .from(schema.scholarshipApplication)
      .where(
        and(
          inArray(
            schema.scholarshipApplication.scholarshipId,
            missingScholarshipIds,
          ),
          eq(schema.scholarshipApplication.status, 'accepted'),
        ),
      )
    const missingApplications = missingScholarshipIds.filter(
      (scholarshipId) =>
        !acceptedApplications.some(
          (application) => application.scholarshipId === scholarshipId,
        ),
    )
    if (missingApplications.length > 0)
      throw new Error(
        `No accepted applications found for demo scholarships: ${missingApplications.join(', ')}`,
      )

    let reportReasons = await tx
      .select({ id: schema.reportReason.id })
      .from(schema.reportReason)
      .where(
        and(
          eq(schema.reportReason.createdBy, admin.id),
          like(schema.reportReason.name, 'Asistencia%'),
        ),
      )
    if (reportReasons.length === 0) {
      reportReasons = await tx
        .insert(schema.reportReason)
        .values({
          name: 'Asistencia irregular',
          createdBy: admin.id,
        })
        .returning({ id: schema.reportReason.id })
    }

    const reports = missingScholarshipIds.map((scholarshipId) => {
      const application = acceptedApplications.find(
        (candidate) => candidate.scholarshipId === scholarshipId,
      )
      if (!application) throw new Error('Accepted application lookup failed.')
      return {
        scholarshipId,
        userId: application.userId,
        reportedBy: admin.id,
        cause: faker.helpers.arrayElement([
          'absence',
          'performance',
          'other',
        ] as const),
        causeDetail: faker.lorem.sentence(),
        reason: faker.helpers.arrayElement(reportReasons).id,
        reasonDetail: faker.lorem.sentence(),
      }
    })

    await tx.insert(schema.scholarshipStudentReport).values(reports)
    return missingScholarshipIds
  })

  console.info(`Created ${result.length} reports for demo scholarships.`)
  if (result.length > 0) console.info(`Scholarship IDs: ${result.join(', ')}`)
}

if (import.meta.main) {
  seedMissingDemoReports().catch((error: unknown) => {
    console.error('Demo report backfill failed:', error)
    process.exitCode = 1
  })
}

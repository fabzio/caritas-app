import db, { schema } from '@api/db'
import { fakerES as faker } from '@faker-js/faker'
import { and, eq, like } from 'drizzle-orm'
import { districts } from './entities/regions'

const demoEmailPattern = 'demo-%@example.test'
const id = () => faker.string.alphanumeric(32).toLowerCase()
const dateOnly = (date: Date) => date.toISOString().slice(0, 10)
const dateInRange = (from: Date, to: Date) => faker.date.between({ from, to })
const pick = <T>(values: T[]) => faker.helpers.arrayElement(values)

const ensureLookups = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) => {
  await tx
    .insert(schema.region)
    .values(
      districts.map((district) => ({
        name: district.name,
        type: 'district' as const,
        code: district.code,
      })),
    )
    .onConflictDoNothing({ target: schema.region.code })

  const typeNames = ['Campaña', 'Charla']
  const statusNames = ['Programado', 'En Progreso', 'Completado', 'Cancelado']
  const specialityNames = [
    'Medicina general',
    'Pediatría',
    'Odontología',
    'Psicología',
    'Nutrición',
    'Enfermería',
  ]

  for (const name of typeNames) {
    const [existing] = await tx
      .select({ id: schema.activityType.id })
      .from(schema.activityType)
      .where(eq(schema.activityType.name, name))
      .limit(1)
    if (!existing) await tx.insert(schema.activityType).values({ name })
  }

  for (const name of statusNames) {
    const [existing] = await tx
      .select({ id: schema.activityStatus.id })
      .from(schema.activityStatus)
      .where(eq(schema.activityStatus.name, name))
      .limit(1)
    if (!existing) await tx.insert(schema.activityStatus).values({ name })
  }

  for (const name of specialityNames) {
    await tx
      .insert(schema.speciality)
      .values({ name, active: true })
      .onConflictDoNothing({ target: schema.speciality.name })
  }
}

const createDemoData = async () => {
  const result = await db.transaction(async (tx) => {
    const [existingDemoUser] = await tx
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(like(schema.user.email, demoEmailPattern))
      .limit(1)
    const [existingDemoOrganization] = await tx
      .select({ id: schema.organization.id })
      .from(schema.organization)
      .where(like(schema.organization.slug, 'demo-%'))
      .limit(1)

    if (existingDemoUser || existingDemoOrganization) {
      throw new Error(
        'Demo records already exist. This seed is intentionally one-time and does not overwrite data.',
      )
    }

    await ensureLookups(tx)

    const [admin] = await tx
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.role, 'admin'))
      .limit(1)
    const [caritas] = await tx
      .select({ id: schema.organization.id })
      .from(schema.organization)
      .where(eq(schema.organization.type, 'caritas'))
      .limit(1)
    const regions = await tx
      .select({ id: schema.region.id, name: schema.region.name })
      .from(schema.region)
      .where(eq(schema.region.type, 'district'))
    if (!admin || !caritas || regions.length === 0) {
      throw new Error(
        'Bootstrap the system first: a Cáritas administrator, organization, and districts are required.',
      )
    }

    const now = new Date()
    const threeMonthsAgo = new Date(now)
    threeMonthsAgo.setMonth(now.getMonth() - 3)
    const threeWeeksAhead = new Date(now)
    threeWeeksAhead.setDate(now.getDate() + 21)
    const pastOnly = new Date(now)
    pastOnly.setDate(now.getDate() - 1)

    const beneficiaries = Array.from({ length: 36 }, (_, index) => {
      const firstName = faker.person.firstName()
      const surname = faker.person.lastName()
      const createdAt = dateInRange(threeMonthsAgo, now)
      return {
        id: id(),
        name: firstName,
        surname,
        email: `demo-person-${index + 1}@example.test`,
        emailVerified: false,
        createdAt,
        updatedAt: createdAt,
        role: null,
        documentType: 'DNI',
        documentNumber: faker.string.numeric(8),
        sex: pick(['F', 'M'] as const),
        birthDate: dateOnly(
          faker.date.birthdate({ min: 8, max: 72, mode: 'age' }),
        ),
        phone: `9${faker.string.numeric(8)}`,
        regionId: pick(regions).id,
        active: true,
        guardianEmail: faker.internet.email({ firstName, lastName: surname }),
        grade: pick([
          '1ro de primaria',
          '3ro de primaria',
          '6to de primaria',
          '1ro de secundaria',
          '3ro de secundaria',
          '5to de secundaria',
        ]),
        insuranceType: pick(['none', 'public', 'private'] as const),
      }
    })

    await tx.insert(schema.user).values(
      beneficiaries.map(
        ({
          id: userId,
          name,
          surname,
          email,
          emailVerified,
          createdAt,
          updatedAt,
          role,
          documentType,
          documentNumber,
          sex,
          birthDate,
          phone,
          regionId,
          active,
        }) => ({
          id: userId,
          name,
          surname,
          email,
          emailVerified,
          createdAt,
          updatedAt,
          role,
          documentType,
          documentNumber,
          sex,
          birthDate,
          phone,
          regionId,
          active,
        }),
      ),
    )

    await tx.insert(schema.studentInfo).values(
      beneficiaries.map((beneficiary) => ({
        userId: beneficiary.id,
        guardianEmail: beneficiary.guardianEmail,
        grade: beneficiary.grade,
        createdAt: beneficiary.createdAt,
        updatedAt: beneficiary.createdAt,
      })),
    )
    await tx.insert(schema.patientInfo).values(
      beneficiaries.map((beneficiary) => ({
        userId: beneficiary.id,
        insuranceType: beneficiary.insuranceType,
      })),
    )

    const partnerSpecs = [
      { name: 'Instituto Horizonte', type: 'education' as const },
      { name: 'Centro Educativo San Marcos', type: 'education' as const },
      { name: 'Fundación Aprender Juntos', type: 'education' as const },
      { name: 'Centro Médico Los Olivos', type: 'health' as const },
      { name: 'Clínica Solidaria Santa Rosa', type: 'health' as const },
      { name: 'Red de Salud Comunitaria', type: 'health' as const },
    ]
    const partners = await tx
      .insert(schema.organization)
      .values(
        partnerSpecs.map((partner, index) => ({
          id: id(),
          name: partner.name,
          type: partner.type,
          slug: `demo-${partner.type}-${index + 1}`,
          createdAt: dateInRange(threeMonthsAgo, now),
        })),
      )
      .returning({ id: schema.organization.id, name: schema.organization.name })
    const educationPartners = partners.slice(0, 3)
    const healthPartners = partners.slice(3)

    const organizationLocations = partners.map((partner) => ({
      organizationId: partner.id,
      regionId: pick(regions).id,
      address: faker.location.streetAddress(),
      createdBy: admin.id,
      state: true,
    }))
    await tx.insert(schema.organizationLocation).values(organizationLocations)

    const majorNames = [
      'Administración',
      'Enfermería técnica',
      'Educación inicial',
      'Contabilidad',
      'Desarrollo de software',
      'Psicología',
    ]
    const majors = await tx
      .insert(schema.organizationMajor)
      .values(
        majorNames.map((name) => ({
          name,
          organizationId: pick(educationPartners).id,
        })),
      )
      .returning({ id: schema.organizationMajor.id })

    const scholarships = await tx
      .insert(schema.scholarship)
      .values(
        Array.from({ length: 6 }, (_, index) => {
          const startDate = new Date(threeMonthsAgo)
          startDate.setDate(startDate.getDate() + index * 12)
          const endDate = new Date(startDate)
          endDate.setMonth(endDate.getMonth() + 2)
          if (index > 3) {
            endDate.setTime(now.getTime())
            endDate.setMonth(now.getMonth() + 1)
          }
          return {
            name: pick([
              'Beca Talento Joven',
              'Impulso a la Educación',
              'Formación para el Futuro',
              'Beca Técnica Solidaria',
              'Oportunidades que Transforman',
              'Programa Excelencia Escolar',
            ]),
            organizationId: pick(educationPartners).id,
            createdBy: admin.id,
            description: faker.lorem.paragraph(),
            requirements:
              'Documento de identidad, constancia de estudios y residencia en Lima.',
            type: pick(['ML', 'PL'] as const),
            startDate: dateOnly(startDate),
            endDate: dateOnly(endDate),
            vacancies: faker.number.int({ min: 8, max: 24 }),
            active: index > 1,
          }
        }),
      )
      .returning({ id: schema.scholarship.id })

    await tx.insert(schema.scholarshipMajor).values(
      scholarships.map((scholarship) => ({
        scholarshipId: scholarship.id,
        majorId: pick(majors).id,
      })),
    )

    const applicationRows = scholarships.flatMap((scholarship) =>
      faker.helpers
        .shuffle(beneficiaries)
        .slice(0, faker.number.int({ min: 7, max: 14 }))
        .map((beneficiary, applicantIndex) => {
          const applicationDate = dateInRange(threeMonthsAgo, pastOnly)
          const status =
            applicantIndex === 0
              ? 'accepted'
              : pick(['pending', 'accepted', 'rejected'] as const)
          return {
            scholarshipId: scholarship.id,
            userId: beneficiary.id,
            applicationDate,
            status,
            reviewedBy: status === 'pending' ? null : admin.id,
            reviewDate: status === 'pending' ? null : applicationDate,
            comments:
              status === 'accepted'
                ? 'Documentación revisada y solicitud aprobada.'
                : status === 'rejected'
                  ? 'La solicitud requiere documentación adicional.'
                  : null,
          }
        }),
    )
    const applications = await tx
      .insert(schema.scholarshipApplication)
      .values(applicationRows)
      .returning({
        scholarshipId: schema.scholarshipApplication.scholarshipId,
        userId: schema.scholarshipApplication.userId,
        status: schema.scholarshipApplication.status,
      })

    const reportReasonNames = [
      'Asistencia irregular',
      'Seguimiento académico',
      'Actualización de datos',
    ]
    await tx
      .insert(schema.reportReason)
      .values(reportReasonNames.map((name) => ({ name, createdBy: admin.id })))
    const reportReasons = await tx
      .select({ id: schema.reportReason.id })
      .from(schema.reportReason)
      .where(
        and(
          eq(schema.reportReason.createdBy, admin.id),
          like(schema.reportReason.name, 'Asistencia%'),
        ),
      )
    const acceptedApplications = applications.filter(
      (application) => application.status === 'accepted',
    )
    const reports = scholarships.flatMap((scholarship) => {
      const application = acceptedApplications.find(
        (candidate) => candidate.scholarshipId === scholarship.id,
      )
      if (!application || reportReasons.length === 0) return []
      return [
        {
          scholarshipId: scholarship.id,
          userId: application.userId,
          reportedBy: admin.id,
          cause: pick(['absence', 'performance', 'other'] as const),
          causeDetail: faker.lorem.sentence(),
          reason: pick(reportReasons).id,
          reasonDetail: faker.lorem.sentence(),
          createdAt: dateInRange(threeMonthsAgo, now),
        },
      ]
    })
    if (reports.length > 0)
      await tx.insert(schema.scholarshipStudentReport).values(reports)

    await tx.insert(schema.organizationOpportunity).values(
      Array.from({ length: 5 }, () => ({
        title: pick([
          'Descuento en matrícula',
          'Beca de continuidad educativa',
          'Taller de preparación universitaria',
          'Asesoría vocacional gratuita',
        ]),
        organizationId: pick(educationPartners).id,
        description: faker.lorem.paragraph(),
        type: pick(['discount', 'scholarship'] as const),
        createdBy: admin.id,
        active: faker.datatype.boolean({ probability: 0.8 }),
      })),
    )

    const fairs = await tx
      .insert(schema.fair)
      .values(
        Array.from({ length: 9 }, (_, index) => {
          const fairDate = dateInRange(
            index < 7 ? threeMonthsAgo : now,
            index < 7 ? pastOnly : threeWeeksAhead,
          )
          const isPast = fairDate < now
          const assistanceCount = isPast
            ? faker.number.int({ min: 60, max: 260 })
            : null
          const fourthGradeAssistance = assistanceCount
            ? faker.number.int({
                min: 10,
                max: Math.floor(assistanceCount / 2),
              })
            : null
          return {
            title: pick([
              'Feria de orientación vocacional',
              'Jornada de oportunidades educativas',
              'Feria de becas y empleo juvenil',
              'Encuentro de familias y educación',
              'Expo carreras técnicas Lima',
            ]),
            address: faker.location.streetAddress(),
            regionId: pick(regions).id,
            createdBy: admin.id,
            active: true,
            startTime: '09:00:00-05',
            endTime: '15:00:00-05',
            date: dateOnly(fairDate),
            assistanceCount,
            fourthGradeAssistance,
            fifthGradeAssistance: assistanceCount
              ? assistanceCount - (fourthGradeAssistance ?? 0)
              : null,
          }
        }),
      )
      .returning({ id: schema.fair.id })
    await tx.insert(schema.fairOrganization).values(
      fairs.flatMap((fair) =>
        faker.helpers
          .shuffle(educationPartners)
          .slice(0, faker.number.int({ min: 1, max: educationPartners.length }))
          .map((partner) => ({ fairId: fair.id, organizationId: partner.id })),
      ),
    )

    const types = await tx.select().from(schema.activityType)
    const statuses = await tx.select().from(schema.activityStatus)
    const specialities = await tx.select().from(schema.speciality)
    const activities = []
    let attentionCount = 0

    for (let index = 0; index < 18; index += 1) {
      const activityDate = dateInRange(threeMonthsAgo, threeWeeksAhead)
      const statusName =
        activityDate > now
          ? 'Programado'
          : faker.helpers.weightedArrayElement([
              { value: 'Completado', weight: 7 },
              { value: 'En Progreso', weight: 2 },
              { value: 'Cancelado', weight: 1 },
            ])
      const [createdActivity] = await tx
        .insert(schema.activity)
        .values({
          name: pick([
            'Campaña de salud integral',
            'Jornada de prevención comunitaria',
            'Atención médica para familias',
            'Charla de nutrición y bienestar',
            'Campaña de salud escolar',
            'Orientación sobre salud mental',
            'Jornada de descarte y prevención',
          ]),
          date: dateOnly(activityDate),
          duration: `${faker.number.int({ min: 2, max: 6 })} hours`,
          spaceId: caritas.id,
          regionId: pick(regions).id,
          address: faker.location.streetAddress(),
          statusId: pick(
            statuses.filter((status) => status.name === statusName),
          ).id,
          typeId: pick(types).id,
          userId: admin.id,
          state: true,
        })
        .returning({ id: schema.activity.id })
      activities.push({ id: createdActivity.id, activityDate, statusName })

      const activityAllies = faker.helpers
        .shuffle(healthPartners)
        .slice(0, faker.number.int({ min: 1, max: healthPartners.length }))
      const participationRows = await tx
        .insert(schema.alliedParticipation)
        .values(
          activityAllies.map((partner) => ({
            activityId: createdActivity.id,
            alliedId: partner.id,
            specialityId: pick(specialities).id,
          })),
        )
        .returning({ id: schema.alliedParticipation.id })

      const attendees = faker.helpers
        .shuffle(beneficiaries)
        .slice(0, faker.number.int({ min: 8, max: 18 }))
      await tx.insert(schema.activityUser).values(
        attendees.map((beneficiary) => ({
          userId: beneficiary.id,
          activityId: createdActivity.id,
          rewarded: faker.datatype.boolean({ probability: 0.55 }),
          timestamp: activityDate,
        })),
      )

      if (statusName === 'Completado') {
        const attentions = attendees.flatMap((beneficiary) =>
          participationRows
            .filter(() => faker.datatype.boolean({ probability: 0.65 }))
            .map((participation) => ({
              userId: beneficiary.id,
              alliedParticipationId: participation.id,
              observations: faker.helpers.maybe(() => faker.lorem.sentence(), {
                probability: 0.7,
              }),
              registeredBy: admin.id,
              timestamp: activityDate,
            })),
        )
        if (attentions.length > 0) {
          await tx.insert(schema.attention).values(attentions)
          attentionCount += attentions.length
        }
      }
    }

    return {
      beneficiaries: beneficiaries.length,
      educationPartners: educationPartners.length,
      healthPartners: healthPartners.length,
      scholarships: scholarships.length,
      applications: applications.length,
      fairs: fairs.length,
      healthActivities: activities.length,
      attentions: attentionCount,
    }
  })

  console.info('Demo data created successfully:')
  console.info(JSON.stringify(result, null, 2))
  console.info('Synthetic account emails use the @example.test domain.')
}

if (import.meta.main) {
  createDemoData().catch((error: unknown) => {
    console.error('Demo data seed failed:', error)
    process.exitCode = 1
  })
}

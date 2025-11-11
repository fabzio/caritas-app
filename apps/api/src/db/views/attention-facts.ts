import {
  type AnyColumn,
  count,
  eq,
  type GetColumnData,
  ne,
  type SQL,
  sql,
} from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { organization, region, user } from '../schemas/auth'
import {
  activity,
  activityStatus,
  activityType,
  activityUser,
  alliedParticipation,
  attention,
  healthSchema,
  patientInfo,
  speciality,
} from '../schemas/health'

const aliasedColumn = <T extends AnyColumn>(
  column: T,
  alias: string,
): SQL.Aliased<GetColumnData<T>> => {
  return column.getSQL().mapWith(column.mapFromDriverValue).as(alias)
}

export const attentionFact = healthSchema.view('attention_fact').as((qb) => {
  const activityUserStats = qb
    .select({
      activityId: sql`activity_user.activity_id`.as('activityId'),
      registrations: count(activityUser.userId).as('registrations'),
      rewarded:
        sql<number>`COUNT(CASE WHEN ${activityUser.rewarded} = true THEN 1 END)`
          .mapWith(Number)
          .as('rewarded'),
      newParticipants: sql<number>`
      COUNT(DISTINCT activity_user.user_id)
      FILTER (
        WHERE NOT EXISTS (
          SELECT 1
          FROM ${activityUser} au2
          WHERE au2.user_id = activity_user.user_id
          AND au2.timestamp < activity_user.timestamp
        )
      )
      `
        .mapWith(Number)
        .as('newParticipants'),
    })
    .from(activityUser)
    .innerJoin(activity, eq(activityUser.activityId, activity.id))
    .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
    .where(ne(activityStatus.name, 'Cancelado'))
    .groupBy(activityUser.activityId)
    .as('activity_user_stats')
  return qb
    .select({
      attentionId: aliasedColumn(attention.id, 'attentionId'),
      timestamp: aliasedColumn(attention.timestamp, 'timestamp'),
      speciality: aliasedColumn(speciality.name, 'speciality'),
      alliedOrganization: aliasedColumn(
        organization.name,
        'alliedOrganization',
      ),
      patientId: aliasedColumn(attention.userId, 'patientId'),
      patientSex: aliasedColumn(user.sex, 'patientSex'),
      patientAge:
        sql<number>`FLOOR(DATE_PART('year', AGE(NOW(), ${user.birthDate})))`
          .mapWith(Number)
          .as('patientAge'),
      patientDocumentType: aliasedColumn(
        user.documentType,
        'patientDocumentType',
      ),
      patientInsuranceType: aliasedColumn(
        patientInfo.insuranceType,
        'patientInsuranceType',
      ),
      activityId: aliasedColumn(activity.id, 'activityId'),
      activityName: aliasedColumn(activity.name, 'activityName'),
      activityDate: aliasedColumn(activity.date, 'activityDate'),
      activityRegistrations: activityUserStats.registrations,
      activityRewarded: activityUserStats.rewarded,
      activityNewParticipants: activityUserStats.newParticipants,
      activityRegion: aliasedColumn(region.name, 'activityRegion'),
      activityType: aliasedColumn(activityType.name, 'activityType'),
      activityStatus: aliasedColumn(activityStatus.name, 'activityStatus'),
    })
    .from(attention)
    .innerJoin(
      alliedParticipation,
      eq(attention.alliedParticipationId, alliedParticipation.id),
    )
    .innerJoin(activity, eq(alliedParticipation.activityId, activity.id))
    .innerJoin(organization, eq(alliedParticipation.alliedId, organization.id))
    .innerJoin(speciality, eq(alliedParticipation.specialityId, speciality.id))
    .innerJoin(region, eq(activity.regionId, region.id))
    .innerJoin(activityType, eq(activity.typeId, activityType.id))
    .innerJoin(activityStatus, eq(activity.statusId, activityStatus.id))
    .innerJoin(patientInfo, eq(attention.userId, patientInfo.userId))
    .innerJoin(user, eq(attention.userId, user.id))
    .leftJoin(activityUserStats, eq(activity.id, activityUserStats.activityId))
    .where(ne(activityStatus.name, 'Cancelado'))
})

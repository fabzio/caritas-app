import { t } from 'elysia'

export namespace AnalyticsModel {
  const _attention = t.Object({
    attentionId: t.Number(),
    timestamp: t.Date(),
    speciality: t.String(),
    alliedOrganization: t.String(),
    patientId: t.String(),
    patientSex: t.Enum({
      F: 'F',
      M: 'M',
    }),
    patientAge: t.Integer(),
    patientDocumentType: t.String(),
    patientInsuranceType: t.String(),
    activityId: t.Number(),
    activityName: t.String(),
    activityDate: t.Date(),
    activityRegistrations: t.Integer(),
    activityRewarded: t.Integer(),
    activityNewParticipants: t.Integer(),
    activityRegion: t.String(),
    activityType: t.String(),
    activityStatus: t.String(),
  })
  export const attentions = t.Array(_attention)
  export type Attentions = typeof attentions.static

  export const attentionsQuery = t.Object({
    activityIds: t.Optional(t.String()),
    startDate: t.Optional(t.String({ format: 'date-time' })),
    endDate: t.Optional(t.String({ format: 'date-time' })),
    sex: t.Optional(
      t.Enum({
        F: 'F',
        M: 'M',
      }),
    ),
    allied: t.Optional(t.String()),
    region: t.Optional(t.String()),
  })
  export type AttentionsQuery = typeof attentionsQuery.static

  const _activityFilter = t.Object({
    activityId: t.Number(),
    activityName: t.String(),
  })
  export const activityFilters = t.Array(_activityFilter)
  export type ActivityFilters = typeof activityFilters.static
}

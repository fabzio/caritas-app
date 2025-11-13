import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const attentions = pgTable('attentions', {
  attentionId: integer().primaryKey(),
  activityId: integer(),
  speciality: varchar({ length: 255 }),
  timestamp: timestamp({
    mode: 'date',
    withTimezone: true,
  }),
  activityStatus: varchar({ length: 100 }),
  activityType: varchar({ length: 100 }),
  alliedOrganization: varchar({ length: 255 }),
  patientId: varchar({ length: 255 }),
  patientSex: varchar({ length: 1 }),
  patientAge: integer(),
  patientDocumentType: varchar({ length: 100 }),
  patientInsuranceType: varchar({ length: 100 }),
  activityName: varchar({ length: 255 }),
  activityDate: timestamp({
    mode: 'date',
    withTimezone: true,
  }),
  activityRegistrations: integer(),
  activityRewarded: integer(),
  activityNewParticipants: integer(),
  activityRegion: varchar({ length: 100 }),
})

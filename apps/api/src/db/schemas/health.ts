import { relations } from 'drizzle-orm'
import {
  boolean,
  date,
  integer,
  interval,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'
import { organization, region, user } from './auth'

export const healthSchema = pgSchema('health')

export const patientInfo = healthSchema.table('patient_info', {
  userId: varchar('user_id', { length: 32 })
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  insuranceType: varchar('insurance_type', {
    length: 20,
    enum: ['none', 'public', 'private'],
  }).notNull(),
})

export const activity = healthSchema.table('activity', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  date: date().notNull(),
  duration: interval({
    fields: 'hour',
  }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  spaceId: varchar('space_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  regionId: integer('region_id')
    .notNull()
    .references(() => region.id, { onDelete: 'restrict' }),
  address: varchar('address', { length: 200 }).notNull(),
  statusId: integer()
    .notNull()
    .references(() => activityStatus.id, { onDelete: 'restrict' }),
  typeId: integer()
    .notNull()
    .references(() => activityType.id, { onDelete: 'restrict' }),
  userId: varchar('user_id', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'set default' }),
  state: boolean().default(true).notNull(),
})

export const activityRelations = relations(activity, ({ many, one }) => ({
  alliedParticipation: many(alliedParticipation),
  attention: many(attention),
  status: one(activityStatus, {
    fields: [activity.statusId],
    references: [activityStatus.id],
  }),
  type: one(activityType, {
    fields: [activity.typeId],
    references: [activityType.id],
  }),
  space: one(organization, {
    fields: [activity.spaceId],
    references: [organization.id],
  }),
  region: one(region, {
    fields: [activity.regionId],
    references: [region.id],
  }),
  creator: one(user, {
    fields: [activity.userId],
    references: [user.id],
  }),
  users: many(activityUser),
}))

export const activityStatus = healthSchema.table('activity_status', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
})
export const activityType = healthSchema.table('activity_type', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 50 }).notNull(),
})

export const activityUser = healthSchema.table(
  'activity_user',
  {
    userId: varchar('user_id', { length: 32 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    activityId: integer()
      .notNull()
      .references(() => activity.id, { onDelete: 'cascade' }),
    rewarded: boolean().default(false).notNull(),
    timestamp: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.activityId] })],
)

export const attention = healthSchema.table('attention', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  observations: text(),
  timestamp: timestamp({
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  userId: varchar('user_id', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  alliedParticipationId: integer()
    .notNull()
    .references(() => alliedParticipation.id, { onDelete: 'cascade' }),
  registeredBy: varchar('registered_by', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const alliedParticipation = healthSchema.table('allied_participation', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  activityId: integer()
    .notNull()
    .references(() => activity.id, { onDelete: 'cascade' }),
  alliedId: varchar('allied_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  specialityId: integer()
    .notNull()
    .references(() => speciality.id, { onDelete: 'cascade' }),
})

export const speciality = healthSchema.table(
  'speciality',
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 100 }).notNull(),
    active: boolean('active').default(true).notNull(),
  },
  (table) => [unique('unique_speciality_name').on(table.name)],
)

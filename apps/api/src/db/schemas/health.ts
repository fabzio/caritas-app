import { relations } from 'drizzle-orm'
import {
  boolean,
  date,
  foreignKey,
  integer,
  interval,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { organization, user } from './auth'

export const healthSchema = pgSchema('health')

export const activity = healthSchema.table('activity', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
  date: date().notNull(),
  duration: interval().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  spaceId: text()
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  statusId: integer()
    .notNull()
    .references(() => activityStatus.id, { onDelete: 'restrict' }),
  typeId: integer()
    .notNull()
    .references(() => activityType.id, { onDelete: 'restrict' }),
  userId: varchar()
    .notNull()
    .references(() => user.id, { onDelete: 'set default' }),
  state: boolean().default(true).notNull(),
})

export const activityRelations = relations(activity, ({ many, one }) => ({
  allied: many(activityAllied),
  atention: many(atention),
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
  creator: one(user, {
    fields: [activity.userId],
    references: [user.id],
  }),
  users: many(activityUser),
}))

export const activityAllied = healthSchema.table(
  'activity_allied',
  {
    activityId: integer()
      .notNull()
      .references(() => activity.id, { onDelete: 'cascade' }),
    alliedId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.activityId, table.alliedId] })],
)

export const activityStatus = healthSchema.table('activity_status', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
})
export const activityType = healthSchema.table('activity_type', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
})

export const activityUser = healthSchema.table(
  'activity_user',
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    activityId: integer()
      .notNull()
      .references(() => activity.id, { onDelete: 'cascade' }),
    rewarded: boolean().default(false).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.activityId] })],
)

export const atention = healthSchema.table(
  'atention',
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    observations: text(),
    timestamp: timestamp().defaultNow().notNull(),
    activityId: integer()
      .notNull()
      .references(() => activity.id, { onDelete: 'cascade' }),
    userId: varchar()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    specialityId: integer().references(() => speciality.id, {
      onDelete: 'set null',
    }),
    registeredBy: varchar()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    foreignKey({
      columns: [table.activityId],
      foreignColumns: [activity.id],
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
    }),
  ],
)

export const organizationSpeciality = healthSchema.table(
  'organization_speciality',
  {
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    specialityId: integer()
      .notNull()
      .references(() => speciality.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.organizationId, table.specialityId] }),
  ],
)

export const speciality = healthSchema.table('speciality', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
})

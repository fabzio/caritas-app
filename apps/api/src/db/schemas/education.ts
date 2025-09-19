import {
  boolean,
  date,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { organization } from './auth'

export const educationSchema = pgSchema('education')

export const scholarship = educationSchema.table('scholarship', {
  id: varchar().primaryKey(),
  name: text().notNull(),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  startDate: date().notNull(),
  endDate: date().notNull(),
  vacancies: integer().notNull(),
  active: boolean().default(true).notNull(),
})

export const scholarshipField = educationSchema.table(
  'scholarship_field',
  {
    scholarshipId: varchar()
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    fieldId: integer()
      .notNull()
      .references(() => studyField.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.scholarshipId, table.fieldId] })],
)

export const vocationalTraining = educationSchema.table('vocational_training', {
  id: varchar().primaryKey(),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  date: date().notNull(),
  statusId: integer()
    .notNull()
    .references(() => trainingStatus.id, { onDelete: 'cascade' }),
})

export const trainingStatus = educationSchema.table('training_status', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
})

export const studyField = educationSchema.table('study_fields', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
})

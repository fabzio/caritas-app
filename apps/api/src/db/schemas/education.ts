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
import { organization, region, user } from './auth'

export const educationSchema = pgSchema('education')

export const organizationMajor = educationSchema.table('organization_major', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
})

export const organizationLocation = educationSchema.table(
  'organization_location',
  {
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    regionId: integer()
      .notNull()
      .references(() => region.id, { onDelete: 'cascade' }),
    address: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
    createdBy: text()
      .notNull()
      .references(() => user.id, { onDelete: 'set null' }),
    state: boolean().default(true).notNull(),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.regionId] })],
)
export const organizationOpportunity = educationSchema.table('opportunity', {
  id: varchar().primaryKey(),
  title: text().notNull(),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  description: text().notNull(),
  type: varchar({
    enum: ['discount', 'scholarship'],
  }).notNull(),
  createdBy: text()
    .notNull()
    .references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
  active: boolean().default(true).notNull(),
})

export const scholarship = educationSchema.table('scholarship', {
  id: varchar().primaryKey(),
  name: text().notNull(),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdBy: text()
    .notNull()
    .references(() => user.id, { onDelete: 'set null' }),
  description: text().notNull(),
  requirements: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
  startDate: date().notNull(),
  endDate: date().notNull(),
  vacancies: integer().notNull(),
  active: boolean().default(true).notNull(),
})

export const scholarshipApplication = educationSchema.table(
  'scholarship_application',
  {
    id: varchar().primaryKey(),
    scholarshipId: varchar()
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    applicationDate: timestamp().defaultNow().notNull(),
    status: varchar({
      enum: ['pending', 'accepted', 'rejected'],
    })
      .default('pending')
      .notNull(),
    reviewedBy: text().references(() => user.id, { onDelete: 'set null' }),
    reviewDate: timestamp(),
    comments: text(),
  },
)

export const scholarshipStudentReport = educationSchema.table(
  'scholarship_student_report',
  {
    id: varchar().primaryKey(),
    scholarshipId: varchar()
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    reportedBy: text()
      .notNull()
      .references(() => user.id, { onDelete: 'set null' }),
    cause: varchar({ enum: ['absence', 'performance', 'other'] }).notNull(),
    causeDetail: text(),
    reason: integer().references(() => reportReason.id, {
      onDelete: 'cascade',
    }),
    reasonDetail: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
)

export const reportReason = educationSchema.table('report_reason', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
  createdBy: text()
    .notNull()
    .references(() => user.id, { onDelete: 'set null' }),
})

export const scholarshipMajor = educationSchema.table(
  'scholarship_major',
  {
    scholarshipId: varchar()
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    majorId: integer()
      .notNull()
      .references(() => organizationMajor.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.scholarshipId, table.majorId] })],
)

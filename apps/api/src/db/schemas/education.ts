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

export const studentInfo = educationSchema.table('student_info', {
  userId: varchar('user_id', { length: 32 })
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  guardianEmail: varchar('guardian_email', { length: 254 }).notNull(),
  grade: varchar('grade', { length: 50 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const organizationMajor = educationSchema.table('organization_major', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
})

export const organizationLocation = educationSchema.table(
  'organization_location',
  {
    organizationId: varchar('organization_id', { length: 32 })
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
    createdBy: varchar('created_by', { length: 32 })
      .notNull()
      .references(() => user.id, { onDelete: 'set null' }),
    state: boolean().default(true).notNull(),
  },
  (table) => [primaryKey({ columns: [table.organizationId, table.regionId] })],
)

export const organizationOpportunity = educationSchema.table('opportunity', {
  id: varchar('id', { length: 32 }).primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  description: text().notNull(),
  type: varchar('type', {
    length: 20,
    enum: ['discount', 'scholarship'],
  }).notNull(),
  createdBy: varchar('created_by', { length: 32 })
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
  id: varchar('id', { length: 32 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdBy: varchar('created_by', { length: 32 })
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
    id: varchar('id', { length: 32 }).primaryKey(),
    scholarshipId: varchar('scholarship_id', { length: 32 })
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 32 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    applicationDate: timestamp().defaultNow().notNull(),
    status: varchar('status', {
      length: 20,
      enum: ['pending', 'accepted', 'rejected'],
    })
      .default('pending')
      .notNull(),
    reviewedBy: varchar('reviewed_by', { length: 32 }).references(
      () => user.id,
      { onDelete: 'set null' },
    ),
    reviewDate: timestamp(),
    comments: text(),
  },
)

export const scholarshipStudentReport = educationSchema.table(
  'scholarship_student_report',
  {
    id: varchar('id', { length: 32 }).primaryKey(),
    scholarshipId: varchar('scholarship_id', { length: 32 })
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 32 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    reportedBy: varchar('reported_by', { length: 32 })
      .notNull()
      .references(() => user.id, { onDelete: 'set null' }),
    cause: varchar('cause', {
      length: 20,
      enum: ['absence', 'performance', 'other'],
    }).notNull(),
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
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
  createdBy: varchar('created_by', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'set null' }),
})

export const scholarshipMajor = educationSchema.table(
  'scholarship_major',
  {
    scholarshipId: varchar('scholarship_id', { length: 32 })
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    majorId: integer()
      .notNull()
      .references(() => organizationMajor.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.scholarshipId, table.majorId] })],
)

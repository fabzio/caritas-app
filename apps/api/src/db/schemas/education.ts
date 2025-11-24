import { relations } from 'drizzle-orm'
import {
  boolean,
  date,
  integer,
  pgSchema,
  primaryKey,
  text,
  time,
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
  createdAt: timestamp({
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp({
    withTimezone: true,
  })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const organizationMajor = educationSchema.table('organization_major', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp({
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp({
    withTimezone: true,
  })
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
    createdAt: timestamp({
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({
      withTimezone: true,
    })
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
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
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
export const fair = educationSchema.table('fair', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  title: varchar('title', { length: 200 }).notNull(),
  address: text('address').notNull(),
  regionId: integer('region_id')
    .notNull()
    .references(() => region.id, { onDelete: 'cascade' }),
  createdBy: varchar('created_by', { length: 32 }).references(() => user.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
  active: boolean('active').default(true).notNull(),
  startTime: time('start_time', {
    withTimezone: true,
  }).notNull(),
  endTime: time('end_time', {
    withTimezone: true,
  }).notNull(),
  date: date('date').notNull(),
  assistanceCount: integer('assistance_count'),
  fourthGradeAssistance: integer('fourth_grade_assistance'),
  fifthGradeAssistance: integer('fifth_grade_assistance'),
})

export const fairOrganization = educationSchema.table('fair_organization', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  fairId: integer('fair_id')
    .notNull()
    .references(() => fair.id, { onDelete: 'cascade' }),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
})
export const fairRelations = relations(fair, ({ many }) => ({
  participants: many(fairOrganization),
}))
export const organizationRelations = relations(organization, ({ many }) => ({
  fairs: many(fairOrganization),
}))
export const fairOrganizationRelations = relations(
  fairOrganization,
  ({ one }) => ({
    fair: one(fair, {
      fields: [fairOrganization.fairId],
      references: [fair.id],
    }),
    organization: one(organization, {
      fields: [fairOrganization.organizationId],
      references: [organization.id],
    }),
  }),
)

export const scholarship = educationSchema.table('scholarship', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdBy: varchar('created_by', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'set null' }),
  description: text().notNull(),
  requirements: text().notNull(),
  createdAt: timestamp({
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  type: varchar('type', {
    length: 2,
    enum: ['ML', 'PL'], // ML: Modular, PL: Plan de estudios
  }).notNull(),
  updatedAt: timestamp({
    withTimezone: true,
  })
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
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    scholarshipId: integer()
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 32 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    applicationDate: timestamp({
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
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
    reviewDate: timestamp({ withTimezone: true }),
    comments: text(),
  },
)

export const scholarshipStudentReport = educationSchema.table(
  'scholarship_student_report',
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    scholarshipId: integer()
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
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
)

export const reportReason = educationSchema.table('report_reason', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
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
    scholarshipId: integer()
      .notNull()
      .references(() => scholarship.id, { onDelete: 'cascade' }),
    majorId: integer()
      .notNull()
      .references(() => organizationMajor.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.scholarshipId, table.majorId] })],
)

export const scholarshipApplicationRelations = relations(
  scholarshipApplication,
  ({ one }) => ({
    user: one(user, {
      fields: [scholarshipApplication.userId],
      references: [user.id],
    }),
    scholarship: one(scholarship, {
      fields: [scholarshipApplication.scholarshipId],
      references: [scholarship.id],
    }),
    reviewer: one(user, {
      fields: [scholarshipApplication.reviewedBy],
      references: [user.id],
    }),
  }),
)

export const scholarshipRelations = relations(scholarship, ({ one }) => ({
  organization: one(organization, {
    fields: [scholarship.organizationId],
    references: [organization.id],
  }),
}))

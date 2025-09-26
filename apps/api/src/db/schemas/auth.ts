import {
  type AnyPgColumn,
  boolean,
  char,
  date,
  integer,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

export const authSchema = pgSchema('auth')

export const user = authSchema.table(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    surname: text('surname').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
    role: text('role'),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    isAnonymous: boolean('is_anonymous'),
    banExpires: timestamp('ban_expires', {
      mode: 'date',
    }),
    documentType: text('document_type'),
    documentNumber: text('document_number').notNull(),
    sex: char({ enum: ['F', 'M'] }).notNull(),
    birthDate: date('birth_date').notNull(),
    phone: varchar('phone', { length: 15 }).notNull(),
    regionId: integer('region_id')
      .notNull()
      .references(() => region.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    uniqueIndex('user_document_number_idx').on(table.documentNumber),
    uniqueIndex('user_phone_idx').on(table.phone),
  ],
)

export const session = authSchema.table('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  activeOrganizationId: text('active_organization_id'),
  activeTeamId: text('active_team_id'),
  impersonatedBy: text('impersonated_by'),
})

export const account = authSchema.table('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
})

export const verification = authSchema.table('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

export const organization = authSchema.table('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
  metadata: text('metadata'),
  type: text('type', {
    enum: ['caritas', 'edu', 'health', 'other'],
  }).notNull(),
})

export const passkey = authSchema.table('passkey', {
  id: text('id').primaryKey(),
  name: text('name'),
  publicKey: text('public_key').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  credentialID: text('credential_id').notNull(),
  counter: integer('counter').notNull(),
  deviceType: text('device_type').notNull(),
  backedUp: boolean('backed_up').notNull(),
  transports: text('transports'),
  createdAt: timestamp('created_at'),
  aaguid: text('aaguid'),
})

export const organizationRole = authSchema.table('organization_role', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  permission: text('permission').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const team = authSchema.table('team', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const teamMember = authSchema.table('team_member', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => team.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at'),
})

export const member = authSchema.table('member', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').default('member').notNull(),
  createdAt: timestamp('created_at').notNull(),
})

export const invitation = authSchema.table('invitation', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role'),
  teamId: text('team_id'),
  status: text('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: text('inviter_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})
export const region = authSchema.table(
  'region',
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', {
      enum: ['department', 'province', 'district'],
    }).notNull(),
    code: varchar('code', { length: 7 }).notNull(),
    parentId: integer().references((): AnyPgColumn => region.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [uniqueIndex('location_code_idx').on(table.code)],
)

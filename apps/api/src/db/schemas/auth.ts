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
import { nanoid } from 'nanoid'

export const authSchema = pgSchema('auth')

export const user = authSchema.table(
  'user',
  {
    id: varchar('id', { length: 32 }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    surname: varchar('surname', { length: 100 }).notNull(),
    email: varchar('email', { length: 254 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: varchar('image', { length: 500 }),
    createdAt: timestamp('created_at')
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp('updated_at')
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
    role: varchar('role', { length: 50 }),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    isAnonymous: boolean('is_anonymous'),
    banExpires: timestamp('ban_expires', {
      mode: 'date',
    }),
    documentType: varchar('document_type', { length: 20 }),
    documentNumber: varchar('document_number', { length: 20 }).notNull(),
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
  id: varchar('id', { length: 32 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  userId: varchar('user_id', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  activeOrganizationId: varchar('active_organization_id', { length: 32 }),
  activeTeamId: varchar('active_team_id', { length: 32 }),
  impersonatedBy: varchar('impersonated_by', { length: 32 }),
})

export const account = authSchema.table('account', {
  id: varchar('id', { length: 32 }).primaryKey(),
  accountId: varchar('account_id', { length: 100 }).notNull(),
  providerId: varchar('provider_id', { length: 50 }).notNull(),
  userId: varchar('user_id', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: varchar('scope', { length: 500 }),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
})

export const verification = authSchema.table('verification', {
  id: varchar('id', { length: 32 }).primaryKey(),
  identifier: varchar('identifier', { length: 100 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
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
  id: varchar('id', { length: 32 })
    .primaryKey()
    .$defaultFn(() => nanoid(32)),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique(),
  logo: varchar('logo', { length: 500 }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
  metadata: text('metadata'),
  type: varchar('type', {
    length: 20,
    enum: ['caritas', 'education', 'health', 'beneficiary'],
  }).notNull(),
})

export const passkey = authSchema.table('passkey', {
  id: varchar('id', { length: 32 }).primaryKey(),
  name: varchar('name', { length: 100 }),
  publicKey: text('public_key').notNull(),
  userId: varchar('user_id', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  credentialID: varchar('credential_id', { length: 255 }).notNull(),
  counter: integer('counter').notNull(),
  deviceType: varchar('device_type', { length: 50 }).notNull(),
  backedUp: boolean('backed_up').notNull(),
  transports: varchar('transports', { length: 255 }),
  createdAt: timestamp('created_at'),
  aaguid: varchar('aaguid', { length: 36 }),
})

export const organizationRole = authSchema.table('organization_role', {
  id: varchar('id', { length: 32 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(),
  permission: varchar('permission', { length: 100 }).notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const team = authSchema.table('team', {
  id: varchar('id', { length: 32 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const teamMember = authSchema.table('team_member', {
  id: varchar('id', { length: 32 }).primaryKey(),
  teamId: varchar('team_id', { length: 32 })
    .notNull()
    .references(() => team.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at'),
})

export const member = authSchema.table('member', {
  id: varchar('id', { length: 32 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 32 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  createdAt: timestamp('created_at').notNull(),
})

export const invitation = authSchema.table('invitation', {
  id: varchar('id', { length: 32 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 32 })
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 254 }).notNull(),
  role: varchar('role', { length: 50 }),
  teamId: varchar('team_id', { length: 32 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: varchar('inviter_id', { length: 32 })
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

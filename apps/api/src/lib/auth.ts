/** biome-ignore-all lint/suspicious/noExplicitAny: openapi types */
import { ac, educationMember, healthMember } from '@api/auth/permisions'
import db from '@api/db'
import * as schema from '@api/db/schemas/auth'
import valkey from '@api/db/valkey'
import env from '@api/env'
import {
  buildEmailVerificationTemplate,
  buildInviteOrganizationTemplate,
  buildPasswordResetTemplate,
  buildSignInTemplate,
} from '@api/mail/templates'
import { APIError, betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  admin,
  anonymous,
  captcha,
  emailOTP,
  oneTap,
  openAPI,
  organization,
} from 'better-auth/plugins'
import { defaultRoles } from 'better-auth/plugins/organization/access'
import { passkey } from 'better-auth/plugins/passkey'
import { localization } from 'better-auth-localization'
import { eq } from 'drizzle-orm'
import transporter, { SENDER } from '../mail'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  secondaryStorage: {
    get: async (key) => {
      return await valkey.get(key)
    },
    set: async (key, value, ttl) => {
      await valkey.set(key, value)
      if (ttl) await valkey.expire?.(key, ttl)
    },
    delete: async (key) => {
      await valkey.del(key)
    },
  },
  user: {
    additionalFields: {
      documentType: {
        type: 'string',
        input: true,
        required: true,
      },
      documentNumber: {
        type: 'string',
        input: true,
        unique: true,
        required: true,
      },
      surname: {
        type: 'string',
        input: true,
        required: true,
      },
      sex: {
        type: 'string',
        input: true,
        required: true,
      },
      birthDate: {
        type: 'string',
        input: true,
        required: true,
      },
      phone: {
        type: 'string',
        input: true,
        required: true,
        unique: true,
      },
      regionId: {
        type: 'number',
        input: true,
        required: true,
      },
      active: {
        type: 'boolean',
        input: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  basePath: '/auth',
  emailAndPassword: {
    enabled: true,
  },

  databaseHooks: {
    user: {
      create: {
        async before(user) {
          const [sameDocument, samePhone, sameEmail] = await Promise.all([
            db.query.user.findFirst({
              where: (u, { eq, and }) =>
                and(
                  eq(u.documentNumber, user.documentNumber as string),
                  eq(u.documentType, user.documentType as string),
                ),
              columns: { id: true },
            }),
            db.query.user.findFirst({
              where: (u, { eq }) => eq(u.phone, user.phone as string),
              columns: { id: true },
            }),
            db.query.user.findFirst({
              where: (u, { eq }) => eq(u.email, user.email as string),
              columns: { id: true },
            }),
          ])

          if (sameEmail)
            throw new APIError('CONFLICT', {
              message: 'El email ya está registrado',
            })

          if (samePhone)
            throw new APIError('CONFLICT', {
              message: 'Teléfono ya registrado',
            })

          if (sameDocument)
            throw new APIError('CONFLICT', {
              message: 'Documento ya registrado',
            })
        },
      },
      update: {
        async before(user) {
          console.log(user)
          const [sameDocument, samePhone, sameEmail] = await Promise.all([
            db.query.user.findFirst({
              where: (u, { eq, and, ne }) =>
                and(
                  eq(u.documentNumber, user.documentNumber as string),
                  eq(u.documentType, user.documentType as string),
                  ne(u.id, user.id as string),
                ),
              columns: { id: true },
            }),
            db.query.user.findFirst({
              where: (u, { eq, and, ne }) =>
                and(
                  eq(u.phone, user.phone as string),
                  ne(u.id, user.id as string),
                ),
              columns: { id: true },
            }),
            db.query.user.findFirst({
              where: (u, { eq, and, ne }) =>
                and(
                  eq(u.email, user.email as string),
                  ne(u.id, user.id as string),
                ),
              columns: { id: true },
            }),
          ])

          if (sameEmail)
            throw new APIError('CONFLICT', {
              message: 'El nuevo email ya le pertenece a otro usuario',
            })

          if (samePhone)
            throw new APIError('CONFLICT', {
              message: 'El nuevo teléfono ya le pertenece a otro usuario',
            })

          if (sameDocument)
            throw new APIError('CONFLICT', {
              message: 'El nuevo documento ya le pertenece a otro usuario',
            })

          return { data: user }
        },
      },
    },
    session: {
      create: {
        async before(session) {
          const [orgResponse, teamResponse] = await Promise.all([
            db.query.member.findFirst({
              where: (member, { eq }) => eq(member.userId, session.userId),
              columns: { organizationId: true },
              orderBy: (member, { desc }) => [desc(member.createdAt)],
            }),
            db.query.teamMember.findFirst({
              where: (teamMember, { eq }) =>
                eq(teamMember.userId, session.userId),
              columns: { teamId: true },
              orderBy: (teamMember, { desc }) => [desc(teamMember.createdAt)],
            }),
          ])

          return {
            data: {
              ...session,
              activeOrganizationId: orgResponse?.organizationId ?? null,
              activeTeamId: teamResponse?.teamId ?? null,
            },
          }
        },
      },
    },
  },
  plugins: [
    openAPI(),
    passkey(),
    organization({
      organizationHooks: {
        afterAcceptInvitation: async ({ invitation: { role }, user }) => {
          if (role.includes('admin'))
            await db
              .update(schema.user)
              .set({ role: 'admin' })
              .where(eq(schema.user.id, user.id))
        },
      },
      schema: {
        organization: {
          additionalFields: {
            type: {
              type: 'string',
              input: true,
              required: true,
            },
          },
        },
        team: {
          additionalFields: {
            role: {
              type: 'string',
              input: true,
              required: false,
            },
          },
        },
      },
      ac,
      roles: {
        ...defaultRoles,
        healthMember,
        educationMember,
      },
      dynamicAccessControl: {
        enabled: true,
      },
      teams: {
        enabled: true,
        defaultTeam: {
          enabled: false,
        },
      },
      sendInvitationEmail: async ({
        inviter,
        invitation,
        email,
        organization,
      }) => {
        const { subject, html } = buildInviteOrganizationTemplate({
          invitedByEmail: inviter.user.email,
          invitedByUsername: inviter.user.name,
          inviteLink: `${env.BETTER_AUTH_URL}/settings/invitations?id=${invitation.id}`,
          teamName: organization.name,
        })
        await transporter.sendMail({
          from: SENDER,
          to: email,
          subject: subject,
          html,
        })
      },
    }),
    admin({}),
    oneTap(),
    anonymous(),
    localization({
      defaultLocale: 'es-ES',
    }),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
    }),
    emailOTP({
      sendVerificationOTP: async ({ type, otp, email }) => {
        const { subject, html } = (() => {
          if (type === 'email-verification')
            return buildEmailVerificationTemplate({ otp })
          if (type === 'forget-password')
            return buildPasswordResetTemplate({
              otp,
              email,
              baseUrl: env.BETTER_AUTH_URL,
            })
          return buildSignInTemplate({ otp })
        })()

        await transporter.sendMail({
          from: SENDER,
          to: email,
          subject: subject,
          html,
        })
      },
    }),
  ],
  socialProviders: {
    google: {
      redirectURI: `${env.BETTER_AUTH_URL}/api/v1/auth/callback/google`,
      prompt: 'select_account',
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
})

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => {
  _schema ??= auth.api.generateOpenAPISchema()
  return _schema
}

export const OpenAPI = {
  getPaths: (prefix: string) =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null)
      for (const path of Object.keys(paths)) {
        const key = prefix + path
        reference[key] = paths[path]

        for (const method of Object.keys(reference[key])) {
          const operation = (reference[key] as any)[method]
          operation.tags = ['Better Auth']
        }
      }
      return reference
    }),
  components: getSchema().then(({ components }) => components),
} as const

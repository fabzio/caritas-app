/** biome-ignore-all lint/suspicious/noExplicitAny: openapi types */

import { ac, educationMember, healthMember } from '@api/auth/permisions'
import db from '@api/db'
import * as schema from '@api/db/schemas/auth'
import valkey from '@api/db/valkey'
import env from '@api/env'
import { betterAuth } from 'better-auth'
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
import transporter from '../mail'
import { buildVerificationOtpEmail } from '../mail/templates/verification-otp'

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
  databaseHooks: {
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
  plugins: [
    openAPI(),
    passkey(),
    organization({
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
        const { subject, html } = buildVerificationOtpEmail({
          type,
          otp,
          email,
          baseUrl: env.BETTER_AUTH_URL,
        })
        await transporter.sendMail({
          to: email,
          subject,
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

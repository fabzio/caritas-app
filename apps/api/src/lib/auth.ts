/** biome-ignore-all lint/suspicious/noExplicitAny: openapi types */
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  admin,
  anonymous,
  oneTap,
  openAPI,
  organization,
} from 'better-auth/plugins'
import { ac } from '@/auth/permisions'
import db from '@/db'
import * as schema from '@/db/schemas/auth'
import env from '@/env'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  user: {
    additionalFields: {
      dni: {
        type: 'string',
        input: true,
        required: true,
        unique: true,
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
      },
      district: {
        type: 'string',
        input: true,
        required: true,
      },
    },
  },
  basePath: '/auth',
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    openAPI(),
    organization({
      ac,
      dynamicAccessControl: {
        enabled: true,
      },
      teams: {
        enabled: true,
      },
    }),
    admin(),
    oneTap(),
    anonymous(),
  ],
  socialProviders: {
    google: {
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

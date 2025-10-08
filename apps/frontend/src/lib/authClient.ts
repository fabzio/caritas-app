import { env } from '@frontend/env.ts'
import type { Auth } from 'api'
import {
  adminClient,
  anonymousClient,
  emailOTPClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  oneTapClient,
  organizationClient,
  passkeyClient,
} from 'better-auth/client/plugins'
import { createAccessControl } from 'better-auth/plugins/access'
import {
  defaultRoles,
  defaultStatements,
} from 'better-auth/plugins/organization/access'
import { createAuthClient } from 'better-auth/react'

const statement = {
  activities: ['view', 'create', 'edit', 'delete', 'manage'],
  scholarships: ['view', 'create', 'edit', 'delete', 'manage'],
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

export const healthMember = ac.newRole({
  activities: ['manage'],
})

export const educationMember = ac.newRole({
  scholarships: ['manage'],
})
const authClient = createAuthClient({
  baseURL: `${env.VITE_API_URL}/api/v1/auth`,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    adminClient(),
    organizationClient({
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
      },
      schema: inferOrgAdditionalFields<Auth>(),
    }),
    oneTapClient({
      clientId: env.VITE_GOOGLE_CLIENT_ID,
    }),
    passkeyClient(),
    anonymousClient(),
    emailOTPClient(),
    inferAdditionalFields<Auth>(),
  ],
})

export default authClient

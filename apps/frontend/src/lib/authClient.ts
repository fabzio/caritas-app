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
import { createAuthClient } from 'better-auth/react'
import { env } from '@/env.ts'

const authClient = createAuthClient({
  baseURL: `${env.VITE_API_URL}/api/v1/auth`,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    adminClient(),
    organizationClient({
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

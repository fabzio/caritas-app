import type { Auth } from 'api'
import {
  adminClient,
  anonymousClient,
  inferAdditionalFields,
  oneTapClient,
  organizationClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { env } from '@/env.ts'

const authClient = createAuthClient({
  baseURL: `${env.VITE_API_URL}/auth`,
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
    }),
    oneTapClient({
      clientId: env.VITE_GOOGLE_CLIENT_ID,
    }),
    anonymousClient(),
    inferAdditionalFields<Auth>(),
  ],
})

export default authClient

export const QueryKeys = {
  SESSION: 'session',
  SETTINGS: {
    ACCOUNTS: 'settings-accounts',
    PASSKEYS: 'settings-passkeys',
  },
  ADMIN: {
    ORGANIZATION: 'admin-organization',
    USERS: 'admin-members',
    PERMISSIONS: 'admin-permissions',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

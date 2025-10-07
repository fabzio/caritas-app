export const QueryKeys = {
  SESSION: 'session',
  ACCESS: 'access',
  ORGANIZATIONS: 'organizations',
  TEAMS: 'teams',
  SETTINGS: {
    ACCOUNTS: 'settings-accounts',
    PASSKEYS: 'settings-passkeys',
  },
  ADMIN: {
    ORGANIZATION: 'admin-organization',
    HEALTH_ORGANIZATION: 'admin-health-organization',
    USERS: 'admin-members',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

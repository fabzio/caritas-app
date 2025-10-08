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
    USERS: 'admin-members',
  },
  HEALTH: {
    ACTIVITIES: 'health-activities',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

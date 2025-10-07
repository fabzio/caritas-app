export const QueryKeys = {
  SESSION: 'session',
  ACCESS: 'access',
  ORGANIZATIONS: 'organizations',
  SCHOLARSHIP: 'scholarships',
  SCHOLARSHIP_APPLICATION: 'scholarship-applications',
  TEAMS: 'teams',
  SETTINGS: {
    ACCOUNTS: 'settings-accounts',
    PASSKEYS: 'settings-passkeys',
  },
  ADMIN: {
    ORGANIZATION: 'admin-organization',
    USERS: 'admin-members',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

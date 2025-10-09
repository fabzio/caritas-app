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
    ORGS_ROLE: 'admin-org-role',
    ORGANIZATION: 'admin-organization',
    ALLIES: 'admin-allies',
    USERS: 'admin-members',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

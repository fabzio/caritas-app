export const QueryKeys = {
  SESSION: 'session',
  ACCESS: 'access',
  ORGANIZATIONS: 'organizations',
  ORGANIZATIONSEDU: 'organizationsEducation',
  ORGANIZATIONSMAJOR: 'organizationsMajor',
  SCHOLARSHIP: 'scholarships',
  TEAMS: 'teams',
  SETTINGS: {
    ACCOUNTS: 'settings-accounts',
    PASSKEYS: 'settings-passkeys',
  },
  ADMIN: {
    ORGS_ROLE: 'admin-org-role',
    ORGANIZATION: 'admin-organization',
    USERS: 'admin-members',
  },
  EDUCATION: {
    SCHOLARSHIP_RECIPIENTS: 'education-scholarship-recipients',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

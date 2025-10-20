export const QueryKeys = {
  SESSION: 'session',
  ACCESS: 'access',
  ORGANIZATIONS: 'organizations',
  ORGANIZATIONSEDU: 'organizationsEducation',
  ORGANIZATIONSMAJOR: 'organizationsMajor',
  SCHOLARSHIP: 'scholarships',
  USER_TEAMS: 'teams',
  SETTINGS: {
    ACCOUNTS: 'settings-accounts',
    PASSKEYS: 'settings-passkeys',
  },
  ADMIN: {
    ORG_TEAMS: 'admin-org-teams',
    ORGS_ROLE: 'admin-org-role',
    ORGANIZATION: 'admin-organization',
    ALLIES: 'admin-allies',
    USERS: 'admin-members',
  },
  EDUCATION: {
    SCHOLARSHIP_RECIPIENTS: 'education-scholarship-recipients',
  },
  HEALTH: {
    ACTIVITIES: 'health-activities',
    SPECIALITIES: 'health-specialities',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

export const QueryKeys = {
  SESSION: 'session',
  ACCESS: 'access',
  ORGANIZATIONS: 'organizations',
  ORGANIZATIONSEDU: 'organizationsEducation',
  ORGANIZATIONSMAJOR: 'organizationsMajor',
  SCHOLARSHIP: 'scholarships',
  SPECIALITY: 'speciality',
  USER_TEAMS: 'teams',
  SETTINGS: {
    ACCOUNTS: 'settings-accounts',
    PASSKEYS: 'settings-passkeys',
    INVITATIONS: 'settings-invitations',
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
    FAIR: 'education-fair',
    SCHOLARSHIP_APPLICATION: 'education-scholarship-applications',
  },
  HEALTH: {
    ACTIVITIES: 'health-activities',
    ADD_ATTENDANT: 'health-activities-add-attendant',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

export const QueryKeys = {
  SESSION: 'session',
  ACCESS: 'access',
  ORGANIZATIONS: 'organizations',
  ORGANIZATIONSEDU: 'organizationsEducation',
  ORGANIZATIONSMAJOR: 'organizationsMajor',
  SCHOLARSHIP: 'scholarships',
  SCHOLARSHIP_APPLICATION: 'scholarship-applications',
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
    SCHOLARSHIP: 'scholarships',
    SCHOLARSHIP_RECIPIENTS: 'education-scholarship-recipients',
    FAIR: 'education-fair',
    SCHOLARSHIP_APPLICATION: 'education-scholarship-applications',
    ORGANIZATIONS: 'education-organizations',
    BENEFICIARIES: 'education-beneficiaries',
  },
  HEALTH: {
    ACTIVITIES: 'health-activities',
    ACTIVITY_DETAIL: 'health-activity-detail',
    ACTIVITY_REGIONS: 'health-activity-regions',
    SPECIALITIES: 'health-specialities',
    BENEFICIARIES: 'health-beneficiaries',
    ACTIVITY: {
      ALLIES: 'health-activity-allies',
      STATUSES: 'health-activity-statuses',
      SPECIALITIES: 'health-activity-specialities',
      TYPES: 'health-activity-types',
    },
    ADD_ATTENDANT: 'health-activities-add-attendant',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

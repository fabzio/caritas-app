export const QueryKeys = {
  SESSION: 'session',
  ADMIN: {
    ORGANIZATION: 'admin-organization',
    MEMBERS: 'admin-members',
    PERMISSIONS: 'admin-permissions',
  },
} as const

export type QueryKey = (typeof QueryKeys)[keyof typeof QueryKeys]

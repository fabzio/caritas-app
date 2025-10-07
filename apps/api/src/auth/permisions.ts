import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements } from 'better-auth/plugins/organization/access'

const statement = {
  activities: ['view', 'create', 'edit', 'delete', 'manage'],
  scholarships: ['view', 'create', 'edit', 'delete', 'manage'],
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

export const healthMember = ac.newRole({
  activities: ['manage'],
})

export const educationMember = ac.newRole({
  scholarships: ['manage'],
})

export type AccessMatrix = {
  admin: boolean
  health: {
    admin: boolean
    organization: boolean
    user: boolean
  }
  education: {
    admin: boolean
    organization: boolean
    user: boolean
  }
  beneficiary: boolean
}

declare module 'better-auth' {
  interface UserWithRole {
    surname: string
    documentType: string
    documentNumber: string
    sex: 'F' | 'M'
    birthDate: Date
    phone: string
    regionId: number
  }
}

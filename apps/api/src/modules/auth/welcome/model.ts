import { t } from 'elysia'

export namespace WelcomeModel {
  export const userWelcome = t.Object({
    userId: t.String(),
    studentInfo: t.Optional(
      t.Object({
        guardianEmail: t.String(),
        grade: t.String(),
      }),
    ),
    patientInfo: t.Optional(
      t.Object({
        insuranceType: t.Enum({
          none: 'none',
          public: 'public',
          private: 'private',
        }),
      }),
    ),
  })
  export type UserWelcome = typeof userWelcome.static
}

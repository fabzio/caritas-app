import db from '@api/db'
import { studentInfo } from '@api/db/schemas/education'
import { patientInfo } from '@api/db/schemas/health'
import type { WelcomeModel } from './model'

export const addAditionalInfo = async (params: WelcomeModel.UserWelcome) => {
  await db.transaction(async (tx) => {
    if (params.studentInfo) {
      await tx.insert(studentInfo).values({
        userId: params.userId,
        grade: params.studentInfo.grade,
        guardianEmail: params.studentInfo.guardianEmail,
      })
    }
    if (params.patientInfo) {
      await tx.insert(patientInfo).values({
        userId: params.userId,
        insuranceType: params.patientInfo.insuranceType,
      })
    }
  })
}

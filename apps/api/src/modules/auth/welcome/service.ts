import db from '@/db'
import { studentInfo } from '@/db/schemas/education'
import { patientInfo } from '@/db/schemas/health'
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

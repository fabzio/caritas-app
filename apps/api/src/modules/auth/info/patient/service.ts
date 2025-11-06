import db from '@api/db'
import { patientInfo } from '@api/db/schemas/health'
import { eq } from 'drizzle-orm'
import type { PatientModel } from './model'

const selection = {
  userId: patientInfo.userId,
  insuranceType: patientInfo.insuranceType,
}

export const createPatientInfo = async (params: PatientModel.Create) => {
  await db.insert(patientInfo).values({
    userId: params.userId,
    insuranceType: params.insuranceType,
  })
}

export const findPatientInfo = async (userId: string) =>
  db.query.patientInfo.findFirst({
    where: (patients, { eq: equals }) => equals(patients.userId, userId),
    columns: {
      userId: true,
      insuranceType: true,
    },
  })

export const updatePatientInfo = async (
  userId: string,
  params: PatientModel.Update,
) => {
  const [updated] = await db
    .update(patientInfo)
    .set({ insuranceType: params.insuranceType })
    .where(eq(patientInfo.userId, userId))
    .returning(selection)

  return updated ?? null
}

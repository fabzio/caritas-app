import Elysia, { status } from 'elysia'
import { PatientModel } from './model'
import {
  createPatientInfo,
  findPatientInfo,
  updatePatientInfo,
} from './service'

export const patient = new Elysia({
  name: 'info.patient',
  prefix: '/patient',
})
  .get(
    ':userId',
    async ({ params: { userId } }) => {
      const record = await findPatientInfo(userId)
      if (!record) throw status(404, 'Patient info not found')
      return record
    },
    {
      params: PatientModel.params,
      response: PatientModel.getResponse,
    },
  )
  .post(
    '',
    async ({ body }) => {
      await createPatientInfo(body)
      return { ok: true }
    },
    {
      body: PatientModel.create,
      response: PatientModel.createResponse,
    },
  )
  .patch(
    ':userId',
    async ({ params: { userId }, body }) => {
      const updated = await updatePatientInfo(userId, body)
      if (!updated) throw status(404, 'Patient info not found')
      return updated
    },
    {
      params: PatientModel.params,
      body: PatientModel.update,
      response: PatientModel.patchResponse,
    },
  )

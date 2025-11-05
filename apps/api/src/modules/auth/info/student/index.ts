import Elysia, { status } from 'elysia'
import { StudentModel } from './model'
import {
  createStudentInfo,
  findStudentInfo,
  updateStudentInfo,
} from './service'

export const student = new Elysia({
  name: 'info.student',
  prefix: '/student',
})
  .get(
    ':userId',
    async ({ params: { userId } }) => {
      const record = await findStudentInfo(userId)
      if (!record) throw status(404, 'Student info not found')
      return record
    },
    {
      params: StudentModel.params,
      response: StudentModel.getResponse,
    },
  )
  .post(
    '',
    async ({ body }) => {
      await createStudentInfo(body)
      return { ok: true }
    },
    {
      body: StudentModel.create,
      response: StudentModel.createResponse,
    },
  )
  .patch(
    ':userId',
    async ({ params: { userId }, body }) => {
      const updated = await updateStudentInfo(userId, body)
      if (!updated) throw status(404, 'Student info not found')
      return updated
    },
    {
      params: StudentModel.params,
      body: StudentModel.update,
      response: StudentModel.patchResponse,
    },
  )

import db from '@api/db'
import { studentInfo } from '@api/db/schemas/education'
import betterAuth from '@api/modules/auth/middleware'
import { eq } from 'drizzle-orm'
import Elysia, { status, t } from 'elysia'
import { BeneficiaryModel } from './model'
import {
  getEducationBeneficiaries,
  getSingleEducationBeneficiary,
  removeEducationBeneficiary,
} from './service'

const beneficiary = new Elysia({
  prefix: '/beneficiaries',
})
  .use(betterAuth)
  .get('/', ({ query }) => getEducationBeneficiaries(query), {
    auth: true,
    query: BeneficiaryModel.listBeneficiariesQuery,
    response: {
      200: BeneficiaryModel.getBeneficiariesResponse,
    },
  })
  .get(
    '/:id',
    async ({ params }) => {
      const res = await getSingleEducationBeneficiary(params.id)
      if (!res) throw status(404, 'Beneficiary not found')
      return res
    },
    {
      auth: true,
      params: BeneficiaryModel.getSingleBeneficiaryQuery,
      response: {
        200: BeneficiaryModel.getSingleBeneficiaryResponse,
        404: t.Literal('Beneficiary not found'),
      },
    },
  )
  .patch(
    ':id',
    async ({ params: { id }, body: { grade, guardianEmail } }) => {
      const existingStudent = await db.query.studentInfo.findFirst({
        where: (studentInfo, { eq }) => eq(studentInfo.userId, id),
      })

      if (!existingStudent) throw status(404, 'Student info not found')

      await db
        .update(studentInfo)
        .set({
          grade,
          guardianEmail,
        })
        .where(eq(studentInfo.userId, id))
    },
    {
      auth: true,
      body: t.Object({
        grade: t.String(),
        guardianEmail: t.String(),
      }),
      response: {
        200: t.Void(),
        404: t.Literal('Student info not found'),
      },
    },
  )
  .delete(
    ':id',
    async ({ params: { id } }) => {
      const removed = await removeEducationBeneficiary(id)
      if (!removed) throw status(404, 'Beneficiary not found')
      return { success: true }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        404: t.Literal('Beneficiary not found'),
      },
    },
  )

export default beneficiary

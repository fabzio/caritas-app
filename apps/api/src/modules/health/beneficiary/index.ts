import db from '@api/db'
import { patientInfo } from '@api/db/schemas/health'
import betterAuth from '@api/modules/auth/middleware'
import { eq } from 'drizzle-orm'
import Elysia, { status, t } from 'elysia'
import { BeneficiaryModel } from './model'
import {
  getHealthBeneficiaries,
  getSingleHealthBeneficiary,
  removeHealthBeneficiary,
} from './service'

const beneficiary = new Elysia({
  prefix: '/beneficiaries',
})
  .use(betterAuth)
  .get('/', ({ query }) => getHealthBeneficiaries(query), {
    auth: true,
    query: BeneficiaryModel.listBeneficiariesQuery,
    response: {
      200: BeneficiaryModel.getBeneficiariesResponse,
    },
  })
  .get(
    '/:id',
    async ({ params }) => {
      const res = await getSingleHealthBeneficiary(params.id)
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
    async ({ params: { id }, body: { insuranceType } }) => {
      const existingPatient = await db.query.patientInfo.findFirst({
        where: (patientInfo, { eq }) => eq(patientInfo.userId, id),
      })

      if (!existingPatient) throw status(404, 'Patient info not found')

      await db
        .update(patientInfo)
        .set({
          insuranceType,
        })
        .where(eq(patientInfo.userId, id))
    },
    {
      auth: true,
      body: t.Object({
        insuranceType: t.Union([
          t.Literal('none'),
          t.Literal('public'),
          t.Literal('private'),
        ]),
      }),
      response: {
        200: t.Void(),
        404: t.Literal('Patient info not found'),
      },
    },
  )
  .delete(
    ':id',
    async ({ params: { id } }) => {
      const removed = await removeHealthBeneficiary(id)
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

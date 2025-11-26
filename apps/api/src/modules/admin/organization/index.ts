import betterAuth from '@api/modules/auth/middleware'
import Elysia, { status, t } from 'elysia'

import { OrganizationModel } from './model'
import {
  checkOrganizationsHaveActiveActivities,
  checkOrganizationsHaveActiveScholarships,
  deleteOrganizations,
  findDuplicateOrganizations,
  getOrganizations,
  getSingleOrganization,
  hasActivitiesAssociated,
  updateOrganization,
} from './service'

const organization = new Elysia({
  name: 'organization',
  prefix: '/organization',
})
  .use(betterAuth)
  .get(
    '/',
    ({ query, session: { activeOrganizationId } }) => {
      if (!activeOrganizationId) throw status(401, 'Unauthorized')
      return getOrganizations({
        ...query,
        organizationId: activeOrganizationId,
      })
    },
    {
      auth: true,
      query: OrganizationModel.listOrganizationsQuery,
      response: {
        200: OrganizationModel.getOrganization,
        401: t.Literal('Unauthorized'),
      },
    },
  )
  .get(
    '/:id',
    async ({ params }) => {
      const res = await getSingleOrganization(params)
      if (!res) throw status(404, 'Organization not found')
      return res
    },
    {
      auth: true,
      params: OrganizationModel.getSingleOrganizationQuery,
      response: {
        200: OrganizationModel.getSingleOrganizationResponse,
        404: t.Literal('Organization not found'),
      },
    },
  )
  .patch(
    '/:id',
    async ({ params, body }) => {
      const id = String(params.id)

      const existing = await getSingleOrganization({ id })
      if (!existing) throw status(404, 'No se encontró la especialidad')

      const duplicate = await findDuplicateOrganizations(body.name, id)
      if (duplicate)
        throw status(400, `La especialidad "${duplicate.name}" ya existe`)

      const updated = await updateOrganization(id, body)
      return updated
    },
    {
      auth: true,
      params: OrganizationModel.getSingleOrganizationQuery,
      body: OrganizationModel.updateOrganization,
      response: {
        200: OrganizationModel.getSingleOrganizationResponse,
        400: t.String(),
        404: t.String(),
      },
    },
  )
  .delete(
    '/',
    async ({ body }) => {
      const { ids } = body
      if (!ids.length)
        throw status(400, 'No hay ningún ID de organización para eliminar')

      // const idsWithActivities = []
      // const organizationNames = []

      // for (const id of ids) {
      //   const hasActivities = await hasActivitiesAssociated(id)
      //   if (hasActivities) {
      //     idsWithActivities.push(id)
      //     const org = await getSingleOrganization({id})
      //     if (org) {
      //       organizationNames.push(org.name)
      //     }
      //   }
      // }
      // if (idsWithActivities.length > 0) {
      //   throw status(
      //     400,
      //     `Las siguientes organizaciones no se pueden eliminar por tener actividades asociadas: ${organizationNames.join(', ')}`,
      //   )
      // }

      const organizationsWithScholarships =
        await checkOrganizationsHaveActiveScholarships(ids)

      if (organizationsWithScholarships.length > 0) {
        throw status(409, {
          organizationsWithScholarships,
        })
      }
      const organizationsWithActivities =
        await checkOrganizationsHaveActiveActivities(ids)
      if (organizationsWithActivities.length > 0) {
        throw status(410, {
          organizationsWithActivities,
        })
      }

      const deleted = await deleteOrganizations(ids)
      return deleted
    },
    {
      auth: true,
      body: OrganizationModel.deleteOrganizations,
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.String(),
        409: OrganizationModel.deleteOrganizationsWithScholarships,
        410: OrganizationModel.deleteOrganizationsWithActivities,
      },
    },
  )

export default organization

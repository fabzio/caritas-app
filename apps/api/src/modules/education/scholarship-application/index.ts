import Elysia, { t } from 'elysia'
import { ScholarshipApplicationModel } from './model'
import {
  createScholarshipApplication,
  getScholarshipApplications,
} from './service'

const scholarshipApplication = new Elysia({
  name: 'scholarship-application',
  prefix: '/scholarship-application',
})
  .get('', getScholarshipApplications, {
    auth: true,
    response: {
      200: ScholarshipApplicationModel.getScholarshipApplication,
      401: t.Literal('Unauthorized'),
    },
  })
  .post('', ({ body }) => createScholarshipApplication(body), {
    auth: true,
    body: ScholarshipApplicationModel.createScholarshipApplication,
    response: {
      200: t.Number({
        description: 'ID of the created scholarship application',
      }),
      401: t.Literal('Unauthorized'),
    },
  })

export default scholarshipApplication

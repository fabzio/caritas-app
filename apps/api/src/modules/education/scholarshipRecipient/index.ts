import Elysia from 'elysia'
import { ScholarshipRecipientModel } from './model'
import { getRecipients, getSelectNamesResponse } from './service'

const scholarshipRecipients = new Elysia({
  prefix: '/scholarshipRecipients',
})
  .get('', ({ query }) => getRecipients(query), {
    query: ScholarshipRecipientModel.listRecipientsQuery,
    response: {
      200: ScholarshipRecipientModel.getlistScholarshipRecipientsResponse,
    },
  })
  .get('/selectNames', () => getSelectNamesResponse(), {
    response: {
      200: ScholarshipRecipientModel.getSelectNamesResponse,
    },
  })

export default scholarshipRecipients

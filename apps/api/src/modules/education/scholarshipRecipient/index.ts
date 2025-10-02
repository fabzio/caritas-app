import Elysia from 'elysia'
import { ScholarshipRecipientModel } from './model'
import { getRecipients } from './service'

const scholarshipRecipients = new Elysia({
  prefix: '/scholarshipRecipients',
}).get('', ({ query }) => getRecipients(query), {
  query: ScholarshipRecipientModel.listRecipientsQuery,
  response: {
    200: ScholarshipRecipientModel.listScholarshipRecipients,
  },
})

export default scholarshipRecipients

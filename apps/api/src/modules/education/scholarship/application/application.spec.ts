import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import applicationModule from '.'

const api = treaty(applicationModule)
describe('Scholarship Application Module', () => {
  it('Should not allow unauthenticated access', async () => {
    const response = await api.application.post({
      scholarshipId: 12,
      userId: 'foo',
    })
    expect(response.status).toBe(401)
  })
  it('Should not allow unauthenticated access to GET /:scholarship_id', async () => {
    const response = await api.application({ scholarship_id: '12' }).get()
    expect(response.status).toBe(401)
  })
})

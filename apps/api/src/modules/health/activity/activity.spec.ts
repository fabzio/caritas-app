import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { auth } from '@/lib/auth'
import activity from '.'

const api = treaty(activity)
describe('Health Activity Module', () => {
  it('Should not allow unauthenticated access', async () => {
    const response = await api.activity.get({ query: {}, headers: {} })
    expect(response.status).toBe(401)
  })
  it('Should list activities for authenticated user', async () => {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })
    const setCookie = headers.get('set-cookie')
    expect(setCookie).toBeDefined()
    const cookie = setCookie
    const response = await api.activity.get({
      query: {},
      headers: {
        cookie,
      },
    })
    expect(response.status).toBe(200)
    expect(response.data).toBeInstanceOf(Array)
  })
})

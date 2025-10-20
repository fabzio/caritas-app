import { describe, expect, it } from 'bun:test'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import fair from '.'

const api = treaty(fair)

describe('Fair Module', () => {
  it('should not allow unauthenticated access', async () => {
    const response = await api.fairs.get({
      query: { page: 0, limit: 10 },
      headers: {},
    })
    expect(response.status).toBe(401)
  })

  it('should list fairs for authenticated user', async () => {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })

    const cookie = headers.get('set-cookie')
    expect(cookie).toBeDefined()

    const response = await api.fairs.get({
      query: { page: 0, limit: 10 },
      headers: { cookie },
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.total).toBeNumber()
    expect(response.data?.page).toBe(0)
    expect(response.data?.limit).toBe(10)
  })
})

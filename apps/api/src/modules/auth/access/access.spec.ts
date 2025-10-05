import { describe, expect, it } from 'bun:test'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import access from '.'

const api = treaty(access)

describe('Auth Access Module', () => {
  it('denies unauthenticated access', async () => {
    const response = await api.access.get({ query: {}, headers: {} })
    expect(response.status).toBe(401)
  })

  it('returns access permissions for authenticated admin user', async () => {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })

    const cookie = headers.get('set-cookie')
    expect(cookie).toBeDefined()

    const response = await api.access.get({
      query: {},
      headers: {
        cookie,
      },
    })

    expect(response.status).toBe(200)
    expect(response.data).toStrictEqual({
      admin: true,
      health: {
        admin: false,
        organization: false,
        user: false,
      },
      education: {
        admin: false,
        organization: false,
        user: false,
      },
      beneficiary: false,
    })
  })
})

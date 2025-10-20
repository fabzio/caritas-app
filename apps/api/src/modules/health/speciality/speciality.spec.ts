import { describe, expect, it } from 'bun:test'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import speciality from '.'

const api = treaty(speciality)

describe('Health Speciality Module', () => {
  it('Should not allow unauthenticated access', async () => {
    const response = await api.speciality.get({ query: {}, headers: {} })
    expect(response.status).toBe(401)
  })

  it('Should list specialities for authenticated user', async () => {
    // Iniciar sesión con usuario de prueba
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })

    const cookie = headers.get('set-cookie')
    expect(cookie).toBeDefined()

    const response = await api.speciality.get({
      query: {},
      headers: { cookie },
    })

    expect(response.status).toBe(200)
    expect(response.data).toBeInstanceOf(Array)
  })

  it('Should create a new speciality for authenticated user', async () => {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })

    const cookie = headers.get('set-cookie')
    expect(cookie).toBeDefined()

    const name = 'Cardiología'

    const response = await api.speciality.post(
      { name },
      { headers: { cookie } },
    )

    expect([200, 201]).toContain(response.status)
    expect(typeof response.data).toBe('number')
  })
})

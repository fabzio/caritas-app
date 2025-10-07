import { describe, expect, it } from 'bun:test'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import users from '.'

const api = treaty(users)

describe('Common Users Module', () => {
  it('returns a list of users', async () => {
    const unique = `${Date.now()}${Math.floor(Math.random() * 1_000)}`
    const email = `user+${unique}@example.com`
    const documentNumber = unique.padEnd(8, '0').slice(0, 8)
    const phone = `+51${unique.slice(-9).padStart(9, '0')}`

    auth.api.createUser({
      body: {
        email,
        name: 'New User',
        password: 'secret-password',
        role: 'user',
        data: {
          surname: 'Example',
          documentType: 'DNI',
          documentNumber,
          sex: 'M',
          birthDate: new Date(2000, 8, 3),
          regionId: 1,
          phone,
        },
      },
    })

    const response = await api.users.get({
      query: {},
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.data.length).toBeGreaterThan(0)

    const userExists =
      Array.isArray(response.data?.data) &&
      response.data.data.some((user) => user.email === email)
    expect(userExists).toBe(true)
  })

  it('returns a single user', async () => {
    const unique = `${Date.now()}${Math.floor(Math.random() * 1_000)}`
    const email = `user+${unique}@example.com`
    const documentNumber = unique.padEnd(8, '0').slice(0, 8)
    const phone = `+51${unique.slice(-9).padStart(9, '0')}`

    auth.api.createUser({
      body: {
        email,
        name: 'New User',
        password: 'secret-password',
        role: 'user',
        data: {
          surname: 'Example',
          documentType: 'DNI',
          documentNumber,
          sex: 'M',
          birthDate: new Date(2000, 8, 3),
          regionId: 1,
          phone,
        },
      },
    })

    const {
      user: { id },
    } = await auth.api.createUser({
      body: {
        email,
        name: 'New User',
        password: 'secret-password',
        role: 'user',
        data: {
          surname: 'Example',
          documentType: 'DNI',
          documentNumber,
          sex: 'M',
          birthDate: new Date(2000, 8, 3),
          regionId: 1,
          phone,
        },
      },
    })

    const response = await api.users({ id }).get({
      query: {},
    })

    expect(response.status).toBe(200)
    expect(response.data?.id).toBe(id)
    expect(response.data?.email).toBe(email)
  })
})

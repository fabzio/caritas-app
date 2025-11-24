import { describe, expect, it } from 'bun:test'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import fair from '.'

const api = treaty(fair)

describe('Fair Module', () => {
  it('should allow unauthenticated access for listing fairs', async () => {
    const response = await api.fairs.get({
      query: { page: 0, limit: 10 },
      headers: {},
    })
    expect(response.status).toBe(200)
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

  it('should require authentication for listing fairs attendance', async () => {
    const response = await api.fairs.attendance.get({
      query: { page: 0, limit: 10 },
      headers: {},
    })
    expect(response.status).toBe(401)
  })

  it('should list fairs attendance for authenticated user', async () => {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })

    const cookie = headers.get('set-cookie')
    expect(cookie).toBeDefined()

    const response = await api.fairs.attendance.get({
      query: { page: 0, limit: 10 },
      headers: { cookie },
    })

    expect(response.status).toBe(200)
    expect(response.data?.data).toBeInstanceOf(Array)
    expect(response.data?.total).toBeNumber()
    expect(response.data?.page).toBe(0)
    expect(response.data?.limit).toBe(10)

    if (response.data && response.data.data.length > 0) {
      const attendanceData = response.data.data[0]
      expect(attendanceData).toHaveProperty('id')
      expect(attendanceData).toHaveProperty('title')
      expect(attendanceData).toHaveProperty('date')
      expect(attendanceData).toHaveProperty('district')
      expect(attendanceData).toHaveProperty('assistanceCount')
      expect(attendanceData).toHaveProperty('fourthGradeAssistance')
      expect(attendanceData).toHaveProperty('fifthGradeAssistance')
      expect(attendanceData).toHaveProperty('status')
    }
  })

  it('should require authentication for updating fair attendance', async () => {
    const response = await api.fairs({ id: '1' }).attendance.patch({
      assistanceCount: 100,
      fourthGradeAssistance: 50,
      fifthGradeAssistance: 50,
    })
    expect(response.status).toBe(401)
  })

  it('should update fair attendance for authenticated user', async () => {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })

    const cookie = headers.get('set-cookie')
    expect(cookie).toBeDefined()

    const response = await api.fairs({ id: '1' }).attendance.patch({
      assistanceCount: 100,
      fourthGradeAssistance: 50,
      fifthGradeAssistance: 50,
    })

    expect(response.status).toBe(200)
    expect(response.data).toBe(1)
  })
})

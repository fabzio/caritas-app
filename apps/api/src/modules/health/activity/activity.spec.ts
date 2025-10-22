import { beforeAll, describe, expect, it } from 'bun:test'
import { auth } from '@api/lib/auth'
import { treaty } from '@elysiajs/eden'
import activityModule from './'

const api = treaty(activityModule)

describe('Health Activity Module', () => {
  let authCookie: string

  beforeAll(async () => {
    const { headers } = await auth.api.signInEmail({
      returnHeaders: true,
      body: { email: 'test@example.com', password: 'password' },
    })
    const setCookie = headers.get('set-cookie')
    if (setCookie) {
      authCookie = setCookie
    }
  })

  describe('Authentication', () => {
    it('Should not allow unauthenticated access', async () => {
      const response = await api.activities.get({ query: {}, headers: {} })
      expect(response.status).toBe(401)
    })
  })

  describe('List Activities', () => {
    it('Should list activities for authenticated user', async () => {
      const response = await api.activities.get({
        query: {},
        headers: {
          cookie: authCookie,
        },
      })
      expect(response.status).toBe(200)
      expect(response.data?.data).toBeInstanceOf(Array)
    })

    it('Should support pagination parameters', async () => {
      const response = await api.activities.get({
        query: { page: 0, limit: 5 },
        headers: {
          cookie: authCookie,
        },
      })
      expect(response.status).toBe(200)
      expect(response.data?.page).toBe(0)
      expect(response.data?.limit).toBe(5)
    })

    it('Should support search query', async () => {
      const response = await api.activities.get({
        query: { q: 'test' },
        headers: {
          cookie: authCookie,
        },
      })
      expect(response.status).toBe(200)
      expect(response.data?.data).toBeInstanceOf(Array)
    })

    it('Should support sorting', async () => {
      const response = await api.activities.get({
        query: { sortBy: 'date.desc' },
        headers: {
          cookie: authCookie,
        },
      })
      expect(response.status).toBe(200)
      expect(response.data?.data).toBeInstanceOf(Array)
    })
  })

  describe('Get Activity Participants', () => {
    it('Should not allow unauthenticated access', async () => {
      const response = await api.activities.participants.get({
        query: { activityId: '1' },
        headers: {},
      })
      expect(response.status).toBe(401)
    })

    it('Should get participants for authenticated user', async () => {
      const response = await api.activities.participants.get({
        query: { activityId: '1' },
        headers: {
          cookie: authCookie,
        },
      })
      expect(response.status).toBe(200)
      expect(response.data).toBeInstanceOf(Array)
    })

    it('Should support search query for participants', async () => {
      const response = await api.activities.participants.get({
        query: { activityId: '1', q: 'john' },
        headers: {
          cookie: authCookie,
        },
      })
      expect(response.status).toBe(200)
      expect(response.data).toBeInstanceOf(Array)
    })
  })

  describe('Get User Attentions', () => {
    it('Should not allow unauthenticated access', async () => {
      const response = await api.activities['user-attentions'].get({
        query: { activityId: '1', userId: 'user-1' },
        headers: {},
      })
      expect(response.status).toBe(401)
    })

    it('Should get user attentions for authenticated user', async () => {
      const response = await api.activities['user-attentions'].get({
        query: { activityId: '1', userId: 'test-user' },
        headers: {
          cookie: authCookie,
        },
      })
      expect(response.status).toBe(200)
      expect(response.data).toBeInstanceOf(Array)
    })

    it('Should support search query for attentions', async () => {
      const response = await api.activities['user-attentions'].get({
        query: { activityId: '1', userId: 'test-user', q: 'medicina' },
        headers: {
          cookie: authCookie,
        },
      })
      expect(response.status).toBe(200)
      expect(response.data).toBeInstanceOf(Array)
    })
  })

  describe('Update Activity User Rewarded Status', () => {
    it('Should not allow unauthenticated access', async () => {
      const response = await api.activities['user-rewarded'].patch(
        { userId: 'user-1', activityId: 1, rewarded: true },
        { headers: {} },
      )
      expect(response.status).toBe(401)
    })

    it('Should update rewarded status for authenticated user', async () => {
      const response = await api.activities['user-rewarded'].patch(
        { userId: 'test-user', activityId: 1, rewarded: true },
        {
          headers: {
            cookie: authCookie,
          },
        },
      )
      expect(response.status).toBe(200)
      expect(response.data?.rewarded).toBe(true)
    })

    it('Should return updated values', async () => {
      const response = await api.activities['user-rewarded'].patch(
        { userId: 'test-user', activityId: 1, rewarded: false },
        {
          headers: {
            cookie: authCookie,
          },
        },
      )
      expect(response.status).toBe(200)
      expect(response.data?.userId).toBe('test-user')
      expect(response.data?.activityId).toBe(1)
      expect(response.data?.rewarded).toBe(false)
    })
  })
})

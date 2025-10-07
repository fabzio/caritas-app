import env from '@api/env'
import { RedisClient } from 'bun'

const valkeyMockRecord: Record<string, string> = {}

const valkeyMock = {
  get(key) {
    return Promise.resolve(valkeyMockRecord[key as string] ?? null)
  },
  set(key, value) {
    valkeyMockRecord[key as string] = value as string
    return Promise.resolve('OK' as const)
  },
  del(key) {
    const exists = valkeyMockRecord[key as string] !== undefined
    delete valkeyMockRecord[key as string]
    return Promise.resolve(exists ? 1 : 0)
  },
} satisfies Pick<RedisClient, 'get' | 'set' | 'del'>

const valkey =
  env.NODE_ENV === 'test' ? valkeyMock : new RedisClient(env.VALKEY_URL)

export default valkey as RedisClient

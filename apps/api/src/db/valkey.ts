import env from '@api/env'
import { RedisClient } from 'bun'

const valkeyMockRecord: Record<string, string> = {}

const valkeyMock = {
  get(key: string) {
    return Promise.resolve(valkeyMockRecord[key] ?? null)
  },
  set(key: string, value: string) {
    valkeyMockRecord[key] = value
    return Promise.resolve('OK' as const)
  },
  del(key: string) {
    const exists = valkeyMockRecord[key] !== undefined
    delete valkeyMockRecord[key]
    return Promise.resolve(exists ? 1 : 0)
  },
} satisfies Pick<RedisClient, 'get' | 'set' | 'del'>

const valkey =
  env.NODE_ENV === 'test' ? valkeyMock : new RedisClient(env.VALKEY_URL)

export default valkey as RedisClient

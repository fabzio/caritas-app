import { treaty } from '@elysiajs/eden'
import type { App } from 'api'
import { env } from '@/env.ts'

const client = treaty<App>(env.VITE_API_URL)
const rpc = client.api.v1
export default rpc

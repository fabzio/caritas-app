import { treaty } from '@elysiajs/eden'
import { env } from '@frontend/env.ts'
import type { App } from 'api'

const client = treaty<App>(env.VITE_API_URL)
const rpc = client.api.v1
export default rpc

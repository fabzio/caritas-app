import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import logixlysia from 'logixlysia'
import env from './env'
import { auth, OpenAPI } from './lib/auth'
import { health } from './modules/health'

const main = async () => {
  const api = new Elysia({
    name: 'api',
    prefix: '/api/v1',
  })
    .use(logixlysia())
    .use(
      openapi({
        enabled: env.NODE_ENV !== 'production',
        documentation: {
          components: await OpenAPI.components,
          paths: await OpenAPI.getPaths('/api/v1/auth'),
        },
      }),
    )
    .mount(auth.handler)
    .use(health)

  if (env.NODE_ENV !== 'production') {
    console.log(`🚀 Running in ${env.NODE_ENV} mode`)
    console.info(
      `Swagger UI running on http://localhost:${env.PORT}/api/v1/openapi`,
    )
  }

  return new Elysia().use(api).listen(env.PORT)
}
const app = main()
export type Auth = typeof auth
export type App = Awaited<typeof app>

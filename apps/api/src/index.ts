import { openapi } from '@elysiajs/openapi'
import Elysia from 'elysia'
import logixlysia from 'logixlysia'
import { educationMember, healthMember } from './auth/permisions'
import { PostgresError } from './db/errors'
import env from './env'
import { auth, OpenAPI } from './lib/auth'
import authModule from './modules/auth'
import common from './modules/common'
import educationModule from './modules/education'
import healthModule from './modules/health'

const main = async () => {
  return new Elysia({
    name: 'api',
    prefix: '/api/v1',
  })
    .use(logixlysia())
    .use(
      openapi({
        enabled: env.NODE_ENV !== 'production',
        documentation: {
          components: (await OpenAPI.components) as any,
          paths: (await OpenAPI.getPaths('/api/v1/auth')) as any,
        },
      }),
    )
    .error({
      PostgresError,
    })
    .onError(({ code, error, status }) => {
      if (code === 'PostgresError') {
        console.error(error)
        return status(500, 'Ocurrió un error desconocido')
      }
    })
    .mount(auth.handler)
    .use(common)
    .use(authModule)
    .use(healthModule)
    .use(educationModule)
    .listen(env.PORT)
}
const app = main()
console.log(`🚀 Running in ${env.NODE_ENV} mode`)
if (env.NODE_ENV !== 'production') {
  console.info(
    `Swagger UI running on http://localhost:${env.PORT}/api/v1/openapi`,
  )
}
export type Auth = typeof auth
export type App = Awaited<typeof app>
export const roles = {
  healthMember,
  educationMember,
}

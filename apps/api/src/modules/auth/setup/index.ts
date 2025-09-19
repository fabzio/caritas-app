import Elysia, { status, t } from 'elysia'
import { isFirstUser, setFirstUserAsAdmin } from './service'

const setup = new Elysia({
  name: 'setup',
  prefix: '/setup',
}).post(
  '',
  async ({ body: { id } }) => {
    const isFirst = await isFirstUser()
    if (isFirst) {
      await setFirstUserAsAdmin(id)
      return status(200)
    }
    return status(401)
  },
  {
    body: t.Object({ id: t.String() }),
  },
)

export default setup

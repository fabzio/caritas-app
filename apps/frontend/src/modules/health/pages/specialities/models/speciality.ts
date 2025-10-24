import type rpc from '@frontend/lib/rpc'

export type Speciality = NonNullable<
  Awaited<ReturnType<typeof rpc.health.speciality.get>>['data']
>['data'][number]

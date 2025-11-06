import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type UseExistentUsersParams = {
  documentNumber?: string
  documentType?: string
  activityId: number
}

export const useExistentUsers = ({
  documentNumber,
  documentType,
  activityId,
}: UseExistentUsersParams) => {
  return useQuery({
    queryKey: [
      QueryKeys.HEALTH.ADD_ATTENDANT,
      { documentNumber, documentType, activityId },
    ],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities['existent-users'].get(
        {
          query: {
            documentNumber: documentNumber || '',
            documentType: documentType || '',
            activityId,
          },
        },
      )
      if (error) throw error
      return data
    },
  })
}

export type ExistentUsersResponse = NonNullable<
  ReturnType<typeof useExistentUsers>['data']
>
export type ExistentUsers = ExistentUsersResponse['data'][number]

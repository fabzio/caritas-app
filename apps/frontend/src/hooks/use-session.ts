import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useSession = () => {
  const {
    data: { data },
    ...rest
  } = useSuspenseQuery({
    queryKey: [QueryKeys.SESSION],
    queryFn: () => authClient.getSession(),
  })
  return { data, ...rest }
}

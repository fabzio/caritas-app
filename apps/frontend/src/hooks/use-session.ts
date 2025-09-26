import { useSuspenseQuery } from '@tanstack/react-query'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

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

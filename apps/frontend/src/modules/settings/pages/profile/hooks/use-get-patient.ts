import { useSession } from '@frontend/hooks/use-session'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useGetPatient = () => {
  const { data: session } = useSession()
  return useQuery({
    queryKey: [QueryKeys.SETTINGS.PATIENT_PROFILE],
    queryFn: async () => {
      const { data, error } = await rpc.auth.info
        .patient({
          userId: session?.user.id as string,
        })
        .get()
      if (error) throw error
      return data
    },
    retry: false,
  })
}

import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteAlliesProps {
  ids: string[]
}
const HAS_ACTIVE_ACTIVITIES_ERROR = 'HAS_ACTIVE_ACTIVITIES'

const useDeleteAllies = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: DeleteAlliesProps) => {
      const { data, error } = await rpc.admin.organization.delete(props)

      if (error) {
        if (error.status === 410) {
          throw new Error(HAS_ACTIVE_ACTIVITIES_ERROR, {
            cause: error.value,
          })
        }
        throw new Error((error.value as string) || 'Error al eliminar')
      }

      return data
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.ALLIES],
      })
      toast.success(
        `Organizaci${props.ids.length > 0 ? 'ón ' : 'ones'} eliminada exitosamente`,
      )
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === HAS_ACTIVE_ACTIVITIES_ERROR) {
          const errorData = error.cause as {
            organizationsWithActivities: Array<{
              organizationId: string
              organizationName: string
              activitiesCount: number
            }>
          }

          const organizations = errorData?.organizationsWithActivities

          if (organizations?.length > 0) {
            const orgList = organizations
              .map(
                (org) =>
                  `"${org.organizationName}" tiene ${org.activitiesCount === undefined ? '' : org.activitiesCount} actividad${org.activitiesCount === 1 ? '' : 'es'} activa${org.activitiesCount === 1 ? '' : 's'}`,
              )
              .join('; ')

            const message =
              organizations.length === 1
                ? `Esta organización no se puede eliminar porque ${orgList}.`
                : `Estas organizaciones no se pueden eliminar porque: ${orgList}.`

            toast.error(message, {
              duration: 8000,
            })
            return
          }

          toast.error('No se puede completar la eliminación en este momento.')
          return
        }

        toast.error(`Error al eliminar las organizaciones: ${error.message}`)
        return
      }

      toast.error('Error al eliminar las organizaciones')
    },
  })
}
export default useDeleteAllies

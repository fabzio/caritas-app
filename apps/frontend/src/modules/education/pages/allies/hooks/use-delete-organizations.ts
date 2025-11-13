import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteOrganizationsProps {
  ids: string[]
}

const HAS_ACTIVE_SCHOLARSHIPS_ERROR = 'HAS_ACTIVE_SCHOLARSHIPS'

const useDeleteOrganizations = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: DeleteOrganizationsProps) => {
      const { data, error } = await rpc.admin.organization.delete(props)

      if (error) {
        if (error.status === 409) {
          throw new Error(HAS_ACTIVE_SCHOLARSHIPS_ERROR, {
            cause: error.value,
          })
        }
        throw new Error((error.value as string) || 'Error al eliminar')
      }

      return data
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.ORGANIZATIONS],
      })
      toast.success(
        `Organizaci${props.ids.length === 1 ? 'ón' : 'ones'} eliminada${props.ids.length === 1 ? '' : 's'} exitosamente`,
      )
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === HAS_ACTIVE_SCHOLARSHIPS_ERROR) {
          const errorData = error.cause as {
            organizationsWithScholarships: Array<{
              organizationId: string
              organizationName: string
              scholarshipCount: number
            }>
          }

          const organizationsWithScholarships =
            errorData?.organizationsWithScholarships

          if (organizationsWithScholarships?.length > 0) {
            const orgList = organizationsWithScholarships
              .map(
                (org) =>
                  `"${org.organizationName}" tiene ${org.scholarshipCount} beca${org.scholarshipCount === 1 ? '' : 's'} activa${org.scholarshipCount === 1 ? '' : 's'}`,
              )
              .join('; ')

            const message =
              organizationsWithScholarships.length === 1
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

export default useDeleteOrganizations

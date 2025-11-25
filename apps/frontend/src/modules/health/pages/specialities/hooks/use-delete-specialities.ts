import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteSpecialitiesProps {
  ids: number[]
}
const HAS_ACTIVE_ACTIVITIES_ERROR = 'HAS_ACTIVE_ACTIVITIES'

const useDeleteSpecialities = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: DeleteSpecialitiesProps) => {
      const { data, error } = await rpc.health.speciality.delete(props)

      if (error) {
        if (error.status === 409) {
          throw new Error(HAS_ACTIVE_ACTIVITIES_ERROR, {
            cause: error.value,
          })
        }
        throw new Error((error.value as string) || 'Error al eliminar')
      }

      return data
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.SPECIALITIES],
      })
      toast.success('Especialidad eliminada exitosamente')
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === HAS_ACTIVE_ACTIVITIES_ERROR) {
          const errorData = error.cause as {
            specialitiesWithActivities: Array<{
              specialityId: string
              specialityName: string
              activityCount: number
            }>
          }

          const speciality = errorData?.specialitiesWithActivities

          if (speciality?.length > 0) {
            const specialityList = speciality
              .map(
                (sp) =>
                  `"${sp.specialityName}" tiene ${sp.activityCount} actividad${sp.activityCount === 1 ? '' : 'es'} activa${sp.activityCount === 1 ? '' : 's'}`,
              )
              .join('; ')

            const message =
              speciality.length === 1
                ? `Esta especialidad no se puede eliminar porque ${specialityList}.`
                : `Estas especialidades no se pueden eliminar porque: ${specialityList}.`

            toast.error(message, {
              duration: 8000,
            })
            return
          }

          toast.error('No se puede completar la eliminación en este momento.')
          return
        }

        toast.error(`Error al eliminar las especialidades: ${error.message}`)
        return
      }
      toast.error(`Error al eliminar la especialidad`)
    },
  })
}
export default useDeleteSpecialities

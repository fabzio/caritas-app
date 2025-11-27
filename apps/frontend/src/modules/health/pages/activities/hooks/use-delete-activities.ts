import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useDeleteActivities = () => {
  const queryClient = useQueryClient()

  const HAS_ACTIVE_ATTENDEES_ERROR = 'HAS_ACTIVE_ATTENDEES'
  const HAS_EXPIRED_ACTIVITIES_ERROR = 'HAS_EXPIRED_ACTIVITIES'

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const { data, error } = await rpc.health.activities.delete({
        ids,
      })

      if (error) {
        if (error.status === 409) {
          throw new Error(HAS_ACTIVE_ATTENDEES_ERROR, {
            cause: error.value,
          })
        }
        if (error.status === 410) {
          throw new Error(HAS_EXPIRED_ACTIVITIES_ERROR, {
            cause: error.value,
          })
        }
        throw new Error((error.value as string) || 'Error al eliminar')
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HEALTH.ACTIVITIES] })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.ACTIVITY_REGIONS],
      })
      toast.success(
        `${data.deletedCount} actividad${data.deletedCount === 1 ? '' : 'es'} eliminada${data.deletedCount === 1 ? '' : 's'} correctamente`,
      )
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === HAS_ACTIVE_ATTENDEES_ERROR) {
          const errorData = error.cause as {
            activitiesWithAttendees: Array<{
              activityId: number
              activityName: string
              attendeesCount: number
            }>
          }

          const activitiesWithAttendees = errorData?.activitiesWithAttendees

          if (activitiesWithAttendees?.length > 0) {
            const list = activitiesWithAttendees
              .map(
                (item) =>
                  `"${item.activityName}" tiene ${item.attendeesCount} asistente${item.attendeesCount === 1 ? '' : 's'} activo${item.attendeesCount === 1 ? '' : 's'}`,
              )
              .join('; ')

            const message =
              activitiesWithAttendees.length === 1
                ? `Esta actividad no se puede eliminar porque ${list}.`
                : `Estas actividades no se pueden eliminar porque: ${list}.`

            toast.error(message, {
              duration: 8000,
            })
            return
          }

          toast.error('No se puede completar la eliminación en este momento.')
          return
        }

        if (error.message === HAS_EXPIRED_ACTIVITIES_ERROR) {
          const errorData = error.cause as {
            expiredActivities: Array<{
              activityId: number
              activityName: string
              activityStatus: string
            }>
          }

          const activities = errorData?.expiredActivities
          if (activities?.length > 0) {
            const list = activities
              .map(
                (item) =>
                  `"${item.activityName}" está en estado ${item.activityStatus}`,
              )
              .join('; ')

            const message =
              activities.length === 1
                ? `Esta actividad no se puede eliminar porque ${list}.`
                : `Estas actividadades no se pueden eliminar porque: ${list}.`

            toast.error(message, {
              duration: 8000,
            })
            return
          }

          toast.error('No se puede completar la eliminación en este momento.')
          return
        }

        toast.error(`Error al eliminar las actividades: ${error.message}`)
        return
      }
      toast.error(`Error al eliminar actividades`)
    },
  })
}

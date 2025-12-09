import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type UpdateReportReasonParams = {
  reportId: number
  reason: string
  reasonDetail: string
}

export function useUpdateReportReason() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      reportId,
      reason,
      reasonDetail,
    }: UpdateReportReasonParams) => {
      const { data, error } = await rpc.education.scholarship
        .report({ id: reportId })
        .patch({
          reason,
          reasonDetail,
        })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_REPORTS],
      })
      toast.success('Motivo registrado exitosamente')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al registrar el motivo')
    },
  })
}

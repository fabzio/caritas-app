import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type CreateReportParams = {
  scholarshipId: number
  userId: string
  reportedBy: string
  cause: 'absence' | 'performance' | 'other'
  causeDetail?: string
  reason: string
  reasonDetail?: string
}

export function useCreateReport() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: CreateReportParams) => {
      const { data, error } =
        await rpc.education.scholarship.report.post(payload)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Reporte creado exitosamente')
      navigate({ to: `/organization/education/scholarship` })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al crear el reporte')
    },
  })
}

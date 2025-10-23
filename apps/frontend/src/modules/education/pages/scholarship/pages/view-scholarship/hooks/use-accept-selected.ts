import { useCallback } from 'react'
import { toast } from 'sonner'
import { useAcceptApplicants } from './use-accept-applicants'
import type { Applicant } from './use-get-applicant'

type UseAcceptSelectedParams = {
  applicants: Applicant[] | undefined
  rowSelection: Record<string, boolean>
  onSuccess?: () => void
}

export function useAcceptSelected({
  applicants,
  rowSelection,
  onSuccess,
}: UseAcceptSelectedParams) {
  const acceptApplicants = useAcceptApplicants()

  const handleAcceptSelected = useCallback(async () => {
    try {
      const selectedIds = Object.keys(rowSelection)
        .map((index) => applicants?.[Number(index)]?.id)
        .filter((id): id is number => id !== undefined)

      if (!selectedIds.length) {
        toast.error('Selecciona al menos un postulante')
        return
      }

      await acceptApplicants.mutateAsync({ ids: selectedIds })

      toast.success('Postulantes aceptados correctamente')
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron aceptar los postulantes')
    }
  }, [applicants, rowSelection, acceptApplicants, onSuccess])

  return {
    handleAcceptSelected,
    isLoading: acceptApplicants.isPending,
  }
}

import { useCallback } from 'react'
import { toast } from 'sonner'
import { useAcceptAll, useAcceptBatch } from './accept-applications'
import type { Applicant } from './use-get-applicant'

type UseAcceptSelectedParams = {
  scholarshipId: number
  applicants: Applicant[] | undefined
  rowSelection: Record<string, boolean>
  onSuccess?: () => void
}

export function useAcceptSelected({
  scholarshipId,
  applicants,
  rowSelection,
  onSuccess,
}: UseAcceptSelectedParams) {
  const acceptBatch = useAcceptBatch()
  const acceptAll = useAcceptAll()

  const handleAcceptSelected = useCallback(async () => {
    try {
      const selectedCount = Object.keys(rowSelection).length
      const totalCount = applicants?.length ?? 0

      if (selectedCount === totalCount) {
        await acceptAll.mutateAsync({ scholarshipId })
      } else {
        const selectedIds = Object.keys(rowSelection)
          .map((index) => applicants?.[Number.parseInt(index)]?.id)
          .filter((id): id is number => id !== undefined)
        await acceptBatch.mutateAsync({ ids: selectedIds })
      }

      toast.success('Postulantes aceptados correctamente')
      onSuccess?.()
    } catch {
      toast.error('No se pudieron aceptar los postulantes')
    }
  }, [
    scholarshipId,
    applicants,
    rowSelection,
    acceptBatch,
    acceptAll,
    onSuccess,
  ])

  return {
    handleAcceptSelected,
    isLoading: acceptBatch.isPending || acceptAll.isPending,
  }
}

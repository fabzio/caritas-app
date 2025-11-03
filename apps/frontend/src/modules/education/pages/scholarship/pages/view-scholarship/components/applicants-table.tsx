import DataTable from '@frontend/shared/components/data-table'
import type { SortingState } from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAcceptApplicants } from '../hooks/use-accept-applicants'
import { useGetApplicants } from '../hooks/use-get-applicant'
import { useRejectApplicants } from '../hooks/use-reject-applicant'
import ActionsButton from './actions-button'
import { applicantsTableColumns } from './applicants-table-columns'

type Props = {
  scholarshipId: number
}

export default function ApplicantsTable({ scholarshipId }: Readonly<Props>) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchTerm, setSearchTerm] = useState('')

  const { data: applicants, isLoading } = useGetApplicants(scholarshipId)
  const { mutateAsync: acceptApplicants, isPending: isAccepting } =
    useAcceptApplicants()
  const { mutateAsync: rejectApplicants, isPending: isRejecting } =
    useRejectApplicants()

  const filteredApplicants = useMemo(() => {
    if (!applicants) return []
    if (!searchTerm.trim()) return applicants

    const normalizedSearch = searchTerm.toLowerCase().trim()
    return applicants.filter((applicant) =>
      applicant.name?.toLowerCase().includes(normalizedSearch),
    )
  }, [applicants, searchTerm])

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedApplicants = selectedRows
    .map((rowIndex) => filteredApplicants?.[rowIndex])
    .filter((a): a is NonNullable<typeof a> => a !== undefined && a !== null)

  const selectedIds = selectedApplicants.map((a) => a.id)

  const handleAccept = async () => {
    if (!selectedIds.length) {
      toast.error('Selecciona al menos un postulante')
      return
    }
    await acceptApplicants({ ids: selectedIds })
    setRowSelection({})
  }

  const handleReject = async () => {
    if (!selectedIds.length) {
      toast.error('Selecciona al menos un postulante')
      return
    }
    await rejectApplicants({ ids: selectedIds })
    setRowSelection({})
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Lista de Postulantes</h3>
        <Badge variant="secondary">
          {filteredApplicants?.length ?? 0} postulante
          {filteredApplicants?.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar postulantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <ActionsButton
          selectedCount={selectedIds.length}
          onAcceptClick={handleAccept}
          onRejectClick={handleReject}
          loading={isAccepting || isRejecting}
        />
      </div>

      <DataTable
        data={filteredApplicants ?? []}
        isLoading={isLoading}
        columns={applicantsTableColumns}
        pagination={pagination}
        paginationOptions={{
          onPaginationChange: setPagination,
          rowCount: filteredApplicants?.length ?? 0,
          pageCount: Math.ceil(
            (filteredApplicants?.length ?? 0) / pagination.pageSize,
          ),
        }}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  )
}

import DataTable from '@frontend/shared/components/data-table'
import type { SortingState } from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { SearchIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useAcceptSelected } from '../hooks/use-accept-selected'
import { useGetApplicants } from '../hooks/use-get-applicant'
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

  const handleSuccess = useCallback(() => {
    setRowSelection({})
  }, [])

  const { handleAcceptSelected, isLoading: isAccepting } = useAcceptSelected({
    applicants,
    rowSelection,
    onSuccess: handleSuccess,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Lista de Postulantes</h3>
        <Badge variant="secondary">{applicants?.length ?? 0} postulantes</Badge>
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
          selectedCount={Object.keys(rowSelection).length}
          onAcceptClick={handleAcceptSelected}
          loading={isAccepting}
        />
      </div>

      <DataTable
        data={applicants ?? []}
        isLoading={isLoading}
        columns={applicantsTableColumns}
        pagination={pagination}
        paginationOptions={{
          onPaginationChange: setPagination,
          rowCount: applicants?.length ?? 0,
          pageCount: Math.ceil((applicants?.length ?? 0) / pagination.pageSize),
        }}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  )
}

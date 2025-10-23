import DataTable from '@frontend/shared/components/data-table'
import { stateToSortBy } from '@frontend/shared/utils/sort-by-to-state'
import { useNavigate } from '@tanstack/react-router'
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type { Scholarship } from '../hooks/use-get-scholarship'

type ScholarshipFilters = {
  name?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: string
}

type Props = {
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
  data: Scholarship[]
  columns: ColumnDef<Scholarship>[]
  paginationState: PaginationState
  sortingState: SortingState
  setFilters: (filters: ScholarshipFilters) => void
  pagination?: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export default function ScholarshipTable({
  rowSelection,
  setRowSelection,
  data,
  columns,
  paginationState,
  sortingState,
  setFilters,
  pagination,
}: Readonly<Props>) {
  const navigate = useNavigate()

  const handleRowClick = (scholarship: Scholarship) => {
    navigate({
      to: '/education/scholarship/$scholarshipId/view',
      params: { scholarshipId: scholarship.id.toString() },
    })
  }

  return (
    <DataTable
      data={data || []}
      columns={columns}
      pagination={paginationState}
      sorting={sortingState}
      onSortingChange={(updateOrValue) => {
        const newSortingState =
          typeof updateOrValue === 'function'
            ? updateOrValue(sortingState)
            : updateOrValue
        setRowSelection({})
        return setFilters({ sortBy: stateToSortBy(newSortingState) })
      }}
      paginationOptions={{
        onPaginationChange: (pagination) => {
          const currentState = {
            pageIndex: paginationState.pageIndex - 1,
            pageSize: paginationState.pageSize,
          }
          const newPaginationState =
            typeof pagination === 'function'
              ? pagination(currentState)
              : pagination
          setFilters({
            pageIndex: newPaginationState.pageIndex + 1,
            pageSize: newPaginationState.pageSize,
          })
        },
        rowCount: pagination?.total || 0,
        pageCount: pagination?.totalPages || 1,
      }}
      setRowSelection={setRowSelection}
      rowSelection={rowSelection}
      onRowClick={handleRowClick}
    />
  )
}

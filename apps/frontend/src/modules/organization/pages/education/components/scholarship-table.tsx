import type { Scholarship } from '@frontend/modules/education/pages/scholarship/hooks/use-get-scholarship'
import type { ScholarshipFilters } from '@frontend/routes/_authenticated/education/scholarship'
import DataTable from '@frontend/shared/components/data-table'
import { stateToSortBy } from '@frontend/shared/utils/sort-by-to-state'
import { useNavigate } from '@tanstack/react-router'
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

type Props = {
  isLoading?: boolean
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
  isLoading,
  paginationState,
  sortingState,
  setFilters,
  pagination,
}: Readonly<Props>) {
  const navigate = useNavigate()

  return (
    <DataTable
      data={data || []}
      isLoading={isLoading}
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
    />
  )
}

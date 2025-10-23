import DataTable from '@frontend/shared/components/data-table'
import type { Filters } from '@frontend/shared/types/filters'
import { stateToSortBy } from '@frontend/shared/utils/sort-by-to-state'
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type { Organization } from '../hooks/use-list-ally'

type Props = {
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
  data: Organization[]
  columns: ColumnDef<Organization>[]
  paginationState: PaginationState
  sortingState: SortingState
  setFilters: (filters: Filters) => void
  pagination?: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}
export default function OrganizationTable({
  rowSelection,
  setRowSelection,
  data,
  columns,
  paginationState,
  sortingState,
  setFilters,
  pagination,
}: Readonly<Props>) {
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
    />
  )
}

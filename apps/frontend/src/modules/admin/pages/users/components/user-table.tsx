import DataTable from '@frontend/shared/components/data-table'
import { stateToSortBy } from '@frontend/shared/utils/sort-by-to-state'
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type { User } from '../hooks/use-list-users'

type Props = {
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
  data: User[]
  columns: ColumnDef<User>[]
  paginationState: PaginationState
  sortingState: SortingState
  setFilters: (filters: any) => void
  pagination?: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}
export default function UserTable({
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
        return setFilters({ sortBy: stateToSortBy(newSortingState) })
      }}
      paginationOptions={{
        onPaginationChange: (pagination) => {
          setFilters(
            typeof pagination === 'function'
              ? pagination(paginationState)
              : pagination,
          )
        },
        rowCount: pagination?.total || 0,
        pageCount: pagination?.totalPages || 1,
      }}
      setRowSelection={setRowSelection}
      rowSelection={rowSelection}
    />
  )
}

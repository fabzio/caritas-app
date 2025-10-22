import type { SpecialitiesFilters } from '@frontend/routes/_authenticated/health/specialities'
import DataTable from '@frontend/shared/components/data-table'
import { stateToSortBy } from '@frontend/shared/utils/sort-by-to-state'
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type { Speciality } from '../hooks/use-get-specialities'

type Props = {
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
  data: Speciality[]
  columns: ColumnDef<Speciality>[]
  paginationState: PaginationState
  sortingState: SortingState
  setFilters: (filters: SpecialitiesFilters) => void
  pagination?: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export default function SpecialityTable({
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
        onPaginationChange: (paginationUpdate) => {
          const currentState = {
            pageIndex: paginationState.pageIndex - 1,
            pageSize: paginationState.pageSize,
          }
          const newPaginationState =
            typeof paginationUpdate === 'function'
              ? paginationUpdate(currentState)
              : paginationUpdate
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

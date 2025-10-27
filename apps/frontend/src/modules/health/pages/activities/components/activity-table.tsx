import type { ActivitySearchSchema } from '@frontend/routes/_authenticated/health/activities'
import DataTable from '@frontend/shared/components/data-table'
import { stateToSortBy } from '@frontend/shared/utils/sort-by-to-state'
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type { Activity } from '../hooks/use-activity'
import { useActivityTable } from '../hooks/use-activity-table'

type ActivityTableProps = {
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
}

type Props = {
  rowSelection?: Record<string, boolean>
  setRowSelection?: OnChangeFn<Record<string, boolean>>
  data: Activity[]
  columns: ColumnDef<Activity>[]
  paginationState: PaginationState
  sortingState: SortingState
  setFilters: (filters: ActivitySearchSchema) => void
  pagination?: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

function ActivityListComponent({
  data,
  columns,
  paginationState,
  sortingState,
  setFilters,
  pagination,
  rowSelection,
  setRowSelection,
}: Readonly<Props>) {
  return (
    <DataTable
      data={data || []}
      columns={columns}
      pagination={paginationState}
      sorting={sortingState}
      // ----------------------------------------------------
      // Lógica de Ordenamiento
      // ----------------------------------------------------
      onSortingChange={(updateOrValue) => {
        const newSortingState =
          typeof updateOrValue === 'function'
            ? updateOrValue(sortingState)
            : updateOrValue

        return setFilters({
          sortBy: stateToSortBy(newSortingState),
        })
      }}
      // ----------------------------------------------------
      // Lógica de Paginación
      // ----------------------------------------------------
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
            pageIndex: newPaginationState.pageIndex,
            pageSize: newPaginationState.pageSize,
          })
        },
        rowCount: pagination?.total || 0,
        pageCount: pagination?.totalPages || 1,
      }}
      setRowSelection={setRowSelection || (() => {})}
      rowSelection={rowSelection}
    />
  )
}

// ----------------------------------------------------
// El Wrapper que usa el Hook
// ----------------------------------------------------
export function ActivityTable({
  rowSelection,
  setRowSelection,
}: ActivityTableProps) {
  const {
    data,
    columns,
    pagination,
    paginationState,
    sortingState,
    setFilters,
    isLoading,
  } = useActivityTable()

  if (isLoading || !data || !pagination) {
    return null
  }

  return (
    <ActivityListComponent
      data={data}
      columns={columns as ColumnDef<Activity>[]}
      pagination={pagination}
      paginationState={paginationState}
      sortingState={sortingState}
      setFilters={setFilters}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
    />
  )
}

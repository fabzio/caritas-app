import DataTable from '@frontend/shared/components/data-table'
import type { Filters } from '@frontend/shared/types/filters'
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
  setRowSelection: OnChangeFn<Record<string, boolean>> // O el tipo de Dispatch de React
}

type Props = {
  rowSelection?: Record<string, boolean>
  setRowSelection?: OnChangeFn<Record<string, boolean>>
  data: Activity[]
  columns: ColumnDef<Activity>[]
  paginationState: PaginationState
  sortingState: SortingState
  setFilters: (filters: Partial<Filters>) => void
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

        // 1. NO LLAMAR CON FUNCIÓN. Llama con un objeto plano.
        // 2. Aquí estás sobrescribiendo el sortBy, lo cual es correcto para la URL.
        return setFilters({
          sortBy: stateToSortBy(newSortingState),
        })
      }}
      // ----------------------------------------------------
      // Lógica de Paginación
      // ----------------------------------------------------
      paginationOptions={{
        onPaginationChange: (pagination) => {
          // Crea un estado base 0 (lo que sale del useReactTable)
          const currentState = {
            pageIndex: paginationState.pageIndex - 1,
            pageSize: paginationState.pageSize,
          }
          const newPaginationState =
            typeof pagination === 'function'
              ? pagination(currentState)
              : pagination

          // ESCRIBE EN LA URL: Transforma el pageIndex de TanStack Table (Base 0) a Base 1 para el hook useFilters
          setFilters({
            page: newPaginationState.pageIndex, // El router/backend espera 'page' (Base 0)
            limit: newPaginationState.pageSize, // El router/backend espera 'limit'
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

  // Manejo de carga mejorado
  if (isLoading || !data || !pagination) {
    // Devuelve null o un componente de carga si es necesario para evitar errores de renderizado
    return null
  }

  return (
    <ActivityListComponent
      // Pasa las props que vienen del hook
      data={data}
      columns={columns as ColumnDef<Activity>[]}
      pagination={pagination}
      paginationState={paginationState}
      sortingState={sortingState}
      setFilters={setFilters}
      // Pasa las props que vienen de index.tsx
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
    />
  )
}

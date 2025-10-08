import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useColumnDefs } from '../components/activity-column'
import { useActivities } from './use-activity'

// Definición de tipo estricto del proyecto
type SortBy = `${string}.${'asc' | 'desc'}`

export const useActivityTable = () => {
  // 1. OBTENER FILTROS del Router (contiene page, limit)
  const { filters: rawFilters, setFilters } = useFilters(
    '/_authenticated/health/activities',
  )

  // 2. CONSTRUCCIÓN DEL OBJETO DE FILTROS (Mapeo de URL -> UI)
  const filtersForHook = {
    q: rawFilters.q,
    pageIndex: (rawFilters.page ?? 0) + 1,
    pageSize: rawFilters.limit ?? 10,
    sortBy: (rawFilters.sortBy || 'name.asc') as SortBy,
  }

  // 3. LLAMAR AL HOOK DE DATOS
  const { data: response, isLoading } = useActivities({
    currentPage: filtersForHook.pageIndex,
    pageSize: filtersForHook.pageSize,
    filters: {
      q: filtersForHook.q,
      sortBy: filtersForHook.sortBy,
    },
  })

  // 4. PREPARAR ESTADOS PARA TANSTACK TABLE
  const sortingState = sortByToState(filtersForHook.sortBy)
  const paginationState = {
    pageIndex: filtersForHook.pageIndex,
    pageSize: filtersForHook.pageSize,
  }

  const columns = useColumnDefs()

  // handleSortingChange HA SIDO ELIMINADA.

  return {
    data: response?.data,
    isLoading,
    setFilters, // Exportamos la función para que el componente haga la lógica de transformación
    columns,
    sortingState,
    paginationState,
    // Propiedades de ordenamiento
    sorting: sortingState,
    onSortingChange: undefined, // Se pasa 'undefined' o no se exporta, el componente lo maneja
    // Datos de paginación
    pagination: response
      ? {
          total: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
        }
      : undefined,
  }
}

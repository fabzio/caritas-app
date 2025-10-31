import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useColumnDefs } from '../components/activity-column'
import { useActivities } from './use-activity'

type SortBy = `${string}.${'asc' | 'desc'}`

export const useActivityTable = () => {
  const { filters: rawFilters, setFilters } = useFilters(
    '/_authenticated/health/activities/',
  )

  const filtersForHook = {
    q: rawFilters.q,
    pageIndex: (rawFilters.page ?? 0) + 1,
    pageSize: rawFilters.limit ?? 10,
    sortBy: (rawFilters.sortBy || 'name.asc') as SortBy,
    regionIds: rawFilters.regionIds,
    startDate: rawFilters.startDate,
    endDate: rawFilters.endDate,
  }

  const { data: response, isLoading } = useActivities({
    currentPage: filtersForHook.pageIndex,
    pageSize: filtersForHook.pageSize,
    filters: {
      q: filtersForHook.q,
      sortBy: filtersForHook.sortBy,
      regionIds: filtersForHook.regionIds,
      startDate: filtersForHook.startDate,
      endDate: filtersForHook.endDate,
    },
  })

  const sortingState = sortByToState(filtersForHook.sortBy)
  const paginationState = {
    pageIndex: filtersForHook.pageIndex,
    pageSize: filtersForHook.pageSize,
  }

  const columns = useColumnDefs()

  return {
    data: response?.data,
    isLoading,
    setFilters,
    columns,
    sortingState,
    paginationState,
    sorting: sortingState,
    onSortingChange: undefined,
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

import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useMemo } from 'react'
import { userTableColumns } from '../components/columns'
import { useListUsers } from './use-list-users'

export const useUserTable = () => {
  const { filters, setFilters } = useFilters('/_authenticated/admin/users/')
  const { data: response } = useListUsers({
    currentPage: filters.pageIndex,
    pageSize: filters.pageSize,
    filters: filters,
  })

  const sortingState = sortByToState(filters.sortBy)
  const paginationState = {
    pageIndex: filters.pageIndex ?? 1,
    pageSize: filters.pageSize ?? 10,
  }

  const columns = useMemo(() => userTableColumns, [])

  return {
    data: response?.data,
    pagination: response
      ? {
          total: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
        }
      : undefined,
    setFilters,
    columns,
    sortingState,
    paginationState,
  }
}

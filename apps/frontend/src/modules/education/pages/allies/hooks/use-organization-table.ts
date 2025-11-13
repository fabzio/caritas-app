import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useMemo } from 'react'
import { OrganizationsTableColumns } from '../components/columns'
import { useListOrganizations } from './use-list-organizations'

export const useOrganizationTable = () => {
  const { filters, setFilters } = useFilters(
    '/_authenticated/education/organization/',
  )
  const { data: response } = useListOrganizations({
    currentPage: filters.pageIndex,
    pageSize: filters.pageSize,
    filters: filters,
  })

  const sortingState = sortByToState(filters.sortBy)
  const paginationState = {
    pageIndex: filters.pageIndex ?? 1,
    pageSize: filters.pageSize ?? 10,
  }

  const columns = useMemo(() => OrganizationsTableColumns, [])

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
    filters,
    setFilters,
    columns,
    sortingState,
    paginationState,
  }
}

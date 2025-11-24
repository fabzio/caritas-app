import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useMemo } from 'react'
import { fairTableColumns } from '../components/fair-column'
import { useGetFairs } from './use-get-fair'

type SortBy = `${string}.${'asc' | 'desc'}`

export const useFairTable = () => {
  const { filters, setFilters } = useFilters(
    '/_authenticated/organization/education/fair/',
  )
  const { data: response, isLoading } = useGetFairs({
    currentPage: filters.pageIndex,
    pageSize: filters.pageSize,
    filters: filters,
  })

  const sortingState = sortByToState((filters.sortBy || 'date.desc') as SortBy)
  const paginationState = {
    pageIndex: filters.pageIndex ?? 1,
    pageSize: filters.pageSize ?? 10,
  }

  const columns = useMemo(() => fairTableColumns, [])

  const data =
    response?.data?.map((fair) => ({
      ...fair,
      date:
        fair.date instanceof Date
          ? new Date(
              fair.date.getTime() + fair.date.getTimezoneOffset() * 60000,
            )
          : fair.date,
    })) ?? []

  return {
    data: data,
    isLoading,
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

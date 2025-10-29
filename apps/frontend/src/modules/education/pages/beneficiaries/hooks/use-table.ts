import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useMemo } from 'react'
import { beneficiaryTableColumns } from '../components/columns'
import { useListBeneficiaries } from './use-list-beneficiaries'

export const useBeneficiaryTable = () => {
  const { filters, setFilters } = useFilters(
    '/_authenticated/education/beneficiaries/',
  )
  const { data: response } = useListBeneficiaries({
    currentPage: filters.pageIndex,
    pageSize: filters.pageSize,
    filters: filters,
  })

  const sortingState = sortByToState(filters.sortBy)
  const paginationState = {
    pageIndex: filters.pageIndex ?? 1,
    pageSize: filters.pageSize ?? 10,
  }

  const columns = useMemo(() => beneficiaryTableColumns, [])

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

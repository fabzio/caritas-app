import type { FairsFilters } from '@frontend/routes/_authenticated/organization/education/fair'
import DataTable from '@frontend/shared/components/data-table'
import { stateToSortBy } from '@frontend/shared/utils/sort-by-to-state'
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import type { Fair } from './fair-column'

type Props = {
  data: Fair[]
  columns: ColumnDef<Fair>[]
  paginationState: PaginationState
  sortingState: SortingState
  setFilters: (filters: FairsFilters) => void
  pagination?: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export default function FairTable({
  data,
  columns,
  paginationState,
  sortingState,
  setFilters,
  pagination,
}: Readonly<Props>) {
  const [rowSelection, setRowSelection] = useState({})

  return (
    <DataTable
      data={data || []}
      columns={columns}
      pagination={paginationState}
      sorting={sortingState}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
      onSortingChange={(updateOrValue) => {
        const newSortingState =
          typeof updateOrValue === 'function'
            ? updateOrValue(sortingState)
            : updateOrValue
        return setFilters({ sortBy: stateToSortBy(newSortingState) })
      }}
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
            pageIndex: newPaginationState.pageIndex + 1,
            pageSize: newPaginationState.pageSize,
          })
        },
        rowCount: pagination?.total || 0,
        pageCount: pagination?.totalPages || 1,
      }}
    />
  )
}

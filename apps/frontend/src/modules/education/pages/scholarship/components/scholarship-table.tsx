import DataTable from '@frontend/shared/components/data-table'
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import {
  type Scholarship,
  scholarshipTableColumns,
} from './scholarship-table-columns'

type Props = {
  scholarships: Scholarship[]
  pagination: PaginationState
  currentPage: number
  pageSize: number
  handlePaginationChange: (p: PaginationState) => void
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
  totalCount: number
  pageCount: number
}

export default function ScholarshipTable({
  scholarships,
  pagination,
  currentPage,
  pageSize,
  handlePaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  setRowSelection,
  totalCount,
  pageCount,
}: Readonly<Props>) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <DataTable
          data={scholarships || []}
          columns={scholarshipTableColumns}
          pagination={pagination}
          sorting={sorting}
          onSortingChange={onSortingChange}
          paginationOptions={{
            onPaginationChange: (updaterOrValue) => {
              const currentPaginationState = {
                pageIndex: currentPage - 1,
                pageSize,
              }
              const next =
                typeof updaterOrValue === 'function'
                  ? updaterOrValue(currentPaginationState)
                  : updaterOrValue
              handlePaginationChange(next)
            },
            rowCount: totalCount,
            pageCount,
          }}
          setRowSelection={setRowSelection}
          rowSelection={rowSelection}
        />
      </div>
    </div>
  )
}

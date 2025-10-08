import DataTable from '@frontend/shared/components/data-table'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import {
  type Scholarship,
  scholarshipTableColumns,
} from './scholarship-table-columns'

type Props = {
  scholarships: Scholarship[]
  pagination: PaginationState
  onPaginationChange: (p: PaginationState) => void
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  rowSelection: Record<string, boolean>
  setRowSelection: (selection: Record<string, boolean>) => void
  totalCount: number
  pageCount: number
}

export default function ScholarshipTable({
  scholarships,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  setRowSelection,
  totalCount,
  pageCount,
}: Props) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <DataTable
          data={scholarships}
          columns={scholarshipTableColumns}
          pagination={pagination}
          paginationOptions={{
            onPaginationChange,
            rowCount: totalCount,
            pageCount,
          }}
          sorting={sorting}
          onSortingChange={onSortingChange}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}

import type { OnChangeFn } from '@tanstack/react-table'
import DataTable from '@/shared/components/data-table'
import { stateToSortBy } from '@/shared/utils/sort-by-to-state'
import type { Recipient } from '../hooks/use-scholarship'
import { useScholarshipRecipientTable } from '../hooks/use-scholarship-table'

type Props = {
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
}
export default function RecipientsTable({
  rowSelection,
  setRowSelection,
}: Readonly<Props>) {
  const {
    data,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useScholarshipRecipientTable()
  return (
    <DataTable<Recipient>
      data={data || []}
      columns={columns}
      pagination={paginationState}
      sorting={sortingState}
      onSortingChange={(updateOrValue) => {
        const newSortingState =
          typeof updateOrValue === 'function'
            ? updateOrValue(sortingState)
            : updateOrValue
        return setFilters({ sortBy: stateToSortBy(newSortingState) })
      }}
      paginationOptions={{
        onPaginationChange: (pagination) => {
          setFilters(
            typeof pagination === 'function'
              ? pagination(paginationState)
              : pagination,
          )
        },
        rowCount: pagination?.total || 0,
        pageCount: pagination?.totalPages || 0,
      }}
      setRowSelection={setRowSelection}
      rowSelection={rowSelection}
    />
  )
}

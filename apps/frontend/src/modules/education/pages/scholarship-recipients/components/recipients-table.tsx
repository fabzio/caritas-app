import type { OnChangeFn } from '@tanstack/react-table'
import DataTable from '@/shared/components/data-table'
import { stateToSortBy } from '@/shared/utils/sort-by-to-state'
import { useScholarshipRecipientTable } from '../hooks/use-scholarship-table'

type Props = {
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
}
export default function RecipientsTable({
  rowSelection,
  setRowSelection,
}: Readonly<Props>) {
  const { data, columns, paginationState, sortingState, setFilters } =
    useScholarshipRecipientTable()
  return (
    <DataTable
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
        rowCount: data?.length || 0,
        pageCount: Math.ceil(data?.length || 0 / paginationState.pageSize || 1),
      }}
      setRowSelection={setRowSelection}
      rowSelection={rowSelection}
    />
  )
}

import DataTable from '@frontend/shared/components/data-table'
import type { OnChangeFn } from '@tanstack/react-table'
import { useSpecialityTable } from '../hooks/use-table'

type Props = {
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
}
export default function SpecialityTable({
  rowSelection,
  setRowSelection,
}: Readonly<Props>) {
  const { data, columns } = useSpecialityTable()
  return (
    <DataTable
      data={data}
      columns={columns}
      pagination={{ pageIndex: 0, pageSize: 10 }}
      sorting={[{ desc: false, id: '' }]}
      onSortingChange={() => {}}
      paginationOptions={{}}
      setRowSelection={setRowSelection}
      rowSelection={rowSelection}
    />
  )
}

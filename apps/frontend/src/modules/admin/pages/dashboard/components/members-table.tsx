import DataTable from '@frontend/shared/components/data-table'
import { useMembersTable } from '../hooks/use-members-table'
import type { Member } from './members-columns'

type Props = {
  members: Member[]
}

export default function MembersTable({ members }: Readonly<Props>) {
  const {
    data,
    columns,
    pagination,
    paginationOptions,
    sorting,
    onSortingChange,
    rowSelection,
    setRowSelection,
  } = useMembersTable(members)

  return (
    <DataTable
      data={data}
      columns={columns}
      pagination={pagination}
      paginationOptions={paginationOptions}
      sorting={sorting}
      onSortingChange={onSortingChange}
      setRowSelection={setRowSelection}
      rowSelection={rowSelection}
    />
  )
}

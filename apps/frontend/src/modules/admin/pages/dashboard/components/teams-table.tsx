import DataTable from '@frontend/shared/components/data-table'
import { useTeamsTable } from '../hooks/use-teams-table'
import type { Team } from './team-columns'

type Props = {
  teams: Team[]
}

export default function TeamsTable({ teams }: Readonly<Props>) {
  const {
    data,
    columns,
    pagination,
    paginationOptions,
    sorting,
    onSortingChange,
    rowSelection,
    setRowSelection,
  } = useTeamsTable(teams)

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

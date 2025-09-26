import type {
  ColumnDef,
  PaginationOptions,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import DataTable from '@/shared/components/data-table'
import type { useOrganization } from '../hooks/use-organization'

type Organization = NonNullable<ReturnType<typeof useOrganization>['data']>
type Team = Organization['teams'][number]

type Props = {
  teams: Team[]
}

type TeamColumnId = 'name' | 'createdAt' | 'updatedAt'

const teamSortAccessors: Record<TeamColumnId, (team: Team) => string | number> =
  {
    name: (team) => team.name,
    createdAt: (team) => new Date(team.createdAt).getTime(),
    updatedAt: (team) => new Date(team.updatedAt ?? team.createdAt).getTime(),
  }

const createTeamColumns = (
  formatter: Intl.DateTimeFormat,
): ColumnDef<Team>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
  },
  {
    id: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Equipo
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => row.original.name,
  },
  {
    id: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Creado el
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => formatter.format(new Date(row.original.createdAt)),
  },
  {
    id: 'updatedAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Actualizado el
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) =>
      row.original.updatedAt
        ? formatter.format(new Date(row.original.updatedAt))
        : 'Sin cambios',
  },
]

export default function TeamsTable({ teams }: Readonly<Props>) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      }),
    [],
  )
  const columns = useMemo(
    () => createTeamColumns(dateFormatter),
    [dateFormatter],
  )

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(teams.length / pagination.pageSize) - 1,
    )
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }))
      setRowSelection({})
    }
  }, [teams.length, pagination.pageIndex, pagination.pageSize])

  const sortedTeams = useMemo(() => {
    if (!sorting.length) return teams
    const sort = sorting[0]
    const accessor = teamSortAccessors[sort.id as TeamColumnId]
    if (!accessor) return teams
    const nextTeams = [...teams]
    nextTeams.sort((a, b) => {
      const aValue = accessor(a)
      const bValue = accessor(b)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.desc ? bValue - aValue : aValue - bValue
      }
      return sort.desc
        ? String(bValue).localeCompare(String(aValue), 'es')
        : String(aValue).localeCompare(String(bValue), 'es')
    })
    return nextTeams
  }, [teams, sorting])

  const paginatedTeams = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return sortedTeams.slice(start, end)
  }, [sortedTeams, pagination.pageIndex, pagination.pageSize])

  const handlePaginationChange: PaginationOptions['onPaginationChange'] = (
    updateOrValue,
  ) => {
    setRowSelection({})
    setPagination((prev) =>
      typeof updateOrValue === 'function' ? updateOrValue(prev) : updateOrValue,
    )
  }

  const paginationState = useMemo(
    () => ({
      pageIndex: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize],
  )

  const pageCount = Math.ceil(teams.length / pagination.pageSize) || 1

  return (
    <DataTable
      data={paginatedTeams}
      columns={columns}
      pagination={paginationState}
      paginationOptions={{
        onPaginationChange: handlePaginationChange,
        rowCount: teams.length,
        pageCount,
      }}
      sorting={sorting}
      onSortingChange={(updateOrValue) => {
        setRowSelection({})
        setSorting((prev) =>
          typeof updateOrValue === 'function'
            ? updateOrValue(prev)
            : updateOrValue,
        )
      }}
      setRowSelection={setRowSelection}
      rowSelection={rowSelection}
    />
  )
}

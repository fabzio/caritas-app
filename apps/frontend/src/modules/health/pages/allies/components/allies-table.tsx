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
import type { useHealthOrganization } from '../hooks/use-health-organization'

type Organizations = NonNullable<
  ReturnType<typeof useHealthOrganization>['data']
>
type Ally = Organizations[number]

type Props = {
  allies: Ally[]
}

type ColumnId = 'name'

const sortAccessors: Record<ColumnId, (ally: Ally) => string | number> = {
  name: (ally) => ally.name,
}

const createColumns = (formatter: Intl.DateTimeFormat): ColumnDef<Ally>[] => [
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
        Aliado
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => row.original.name,
  },
]

export default function AlliesTable({ allies }: Readonly<Props>) {
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
  const columns = useMemo(() => createColumns(dateFormatter), [dateFormatter])

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(allies.length / pagination.pageSize) - 1,
    )
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }))
      setRowSelection({})
    }
  }, [allies.length, pagination.pageIndex, pagination.pageSize])

  const sortedTeams = useMemo(() => {
    if (!sorting.length) return allies
    const sort = sorting[0]
    const accessor = sortAccessors[sort.id as ColumnId]
    if (!accessor) return allies
    const nextTeams = [...allies]
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
  }, [allies, sorting])

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

  const pageCount = Math.ceil(allies.length / pagination.pageSize) || 1

  return (
    <DataTable
      data={paginatedTeams}
      columns={columns}
      pagination={paginationState}
      paginationOptions={{
        onPaginationChange: handlePaginationChange,
        rowCount: allies.length,
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

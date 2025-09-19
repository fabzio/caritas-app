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
type Member = Organization['members'][number]

type Props = {
  members: Member[]
}

type MemberColumnId = 'name' | 'email' | 'role' | 'createdAt'

const memberSortAccessors: Record<
  MemberColumnId,
  (member: Member) => string | number
> = {
  name: (member) => member.user?.name ?? '',
  email: (member) => member.user?.email ?? '',
  role: (member) => member.role,
  createdAt: (member) => new Date(member.createdAt).getTime(),
}

const createMemberColumns = (
  formatter: Intl.DateTimeFormat,
): ColumnDef<Member>[] => [
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
        Nombre
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => row.original.user?.name ?? 'Sin nombre',
  },
  {
    id: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Email
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => row.original.user?.email ?? 'Sin correo',
  },
  {
    id: 'role',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Rol
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => row.original.role,
  },
  {
    id: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Miembro desde
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => formatter.format(new Date(row.original.createdAt)),
  },
]

export default function MembersTable({ members }: Readonly<Props>) {
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
    () => createMemberColumns(dateFormatter),
    [dateFormatter],
  )

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(members.length / pagination.pageSize) - 1,
    )
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }))
      setRowSelection({})
    }
  }, [members.length, pagination.pageIndex, pagination.pageSize])

  const sortedMembers = useMemo(() => {
    if (!sorting.length) return members
    const sort = sorting[0]
    const accessor = memberSortAccessors[sort.id as MemberColumnId]
    if (!accessor) return members
    const nextMembers = [...members]
    nextMembers.sort((a, b) => {
      const aValue = accessor(a)
      const bValue = accessor(b)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.desc ? bValue - aValue : aValue - bValue
      }
      return sort.desc
        ? String(bValue).localeCompare(String(aValue), 'es')
        : String(aValue).localeCompare(String(bValue), 'es')
    })
    return nextMembers
  }, [members, sorting])

  const paginatedMembers = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return sortedMembers.slice(start, end)
  }, [sortedMembers, pagination.pageIndex, pagination.pageSize])

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

  const pageCount = Math.ceil(members.length / pagination.pageSize) || 1

  return (
    <DataTable
      data={paginatedMembers}
      columns={columns}
      pagination={paginationState}
      paginationOptions={{
        onPaginationChange: handlePaginationChange,
        rowCount: members.length,
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

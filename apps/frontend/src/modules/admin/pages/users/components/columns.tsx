import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import type { User } from '../hooks/use-list-users'
import { formatRoles } from '../utils/format-roles'

export const userTableColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        araia-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'document',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Documento
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <Button asChild variant="link">
        <Link
          to="/admin/users/form"
          search={{ type: 'edit', id: row.original.id }}
        >
          {`${row.original.documentType} - ${row.original.documentNumber}`}
        </Link>
      </Button>
    ),
  },
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nombre
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => `${row.original.name} ${row.original.surname}`,
  },
  {
    accessorKey: 'roles',
    header: () => <div>Rol</div>,
    cell: ({ row }) => formatRoles(row.original.roles),
    enableSorting: false,
  },
]

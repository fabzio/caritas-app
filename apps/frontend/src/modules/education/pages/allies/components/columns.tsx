import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import type { Organization } from '../hooks/use-list-organizations'

export const OrganizationsTableColumns: ColumnDef<Organization>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nombre
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => `${row.original.name}`,
  },
]

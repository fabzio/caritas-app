import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import type { Scholarship } from '../hooks/use-get-scholarship'

export const scholarshipTableColumns: ColumnDef<Scholarship>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
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
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'organization',
    header: () => <div>Organización</div>,
    cell: ({ row }) => row.original.organization?.name || 'N/A',
    enableSorting: false,
  },
  {
    accessorKey: 'vacancies',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Vacantes
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => row.original.vacancies,
  },
  // {
  //   accessorKey: 'active',
  //   header: ({ column }) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //     >
  //       Estado
  //       <ArrowUpDown />
  //     </Button>
  //   ),
  //   cell: ({ row }) => (
  //     <Badge variant={row.original.active ? 'default' : 'secondary'}>
  //       {row.original.active ? 'Activa' : 'Inactiva'}
  //     </Badge>
  //   ),
  // },
]

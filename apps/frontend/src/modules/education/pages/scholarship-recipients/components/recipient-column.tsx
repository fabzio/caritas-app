import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import type { Recipient } from '../hooks/use-scholarship'

export const scholarshipRecipientTableColumns: ColumnDef<Recipient>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
    cell: ({ row }) =>
      `${row.original.documentType} - ${row.original.documentNumber}`,
  },
  {
    accessorKey: 'scholarship',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Beca
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => row.original.scholarshipName || 'Sin beca asignada', //No deberia ocurrir
    enableSorting: false,
    meta: {
      filterVariant: 'select',
    },
  },
  {
    accessorKey: 'organization',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Organización
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => row.original.organizationName,
  },
  // {
  //   accessorKey: 'region',
  //   header: ({ column }) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //     >
  //       Región
  //       <ArrowUpDown />
  //     </Button>
  //   ),
  //   cell: ({ row }) => row.original.region,
  // },
]

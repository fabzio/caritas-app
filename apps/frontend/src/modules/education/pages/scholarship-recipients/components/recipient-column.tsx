import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import type { ScholarshipRecipient } from '../hooks/use-scholarship'
import StatusIcon from './status-icon'

export const scholarshipRecipientTableColumns: ColumnDef<ScholarshipRecipient>[] =
  [
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
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <StatusIcon status={row.original.status} />,
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
      cell: ({ row }) => row.original.scholarshipName,
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
    {
      accessorKey: 'organization',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Región
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => row.original.region,
    },
  ]

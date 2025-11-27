import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import type { Scholarship } from '../hooks/use-get-scholarship'

export const scholarshipTableColumns: ColumnDef<Scholarship>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.original.name}</div>,
  },
  {
    accessorKey: 'organization',
    header: () => <div className="text-center">Organización</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.organization?.name || 'N/A'}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'vacancies',
    header: ({ column }) => (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Vacantes
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.vacancies}</div>
    ),
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha de inicio
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const date = row.original.startDate
      if (!date) return <div className="text-center">N/A</div>

      return (
        <div className="text-center">
          {new Date(date).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha de fin
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const date = row.original.endDate
      if (!date) return <div className="text-center">N/A</div>

      return (
        <div className="text-center">
          {new Date(date).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
      )
    },
  },
]

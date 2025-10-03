import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import type { useOrganization } from '../hooks/use-organization'

type Organization = NonNullable<ReturnType<typeof useOrganization>['data']>
export type Team = Organization['teams'][number]

export const teamColumns: ColumnDef<Team>[] = [
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
    cell: ({ row }) =>
      row.original.createdAt.toLocaleDateString('es-PE', {
        dateStyle: 'medium',
      }) || 'Desconocido',
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
        ? row.original.updatedAt.toLocaleDateString('es-PE', {
            dateStyle: 'medium',
          })
        : 'Sin cambios',
  },
]

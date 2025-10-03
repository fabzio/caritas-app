import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import type { useOrganization } from '../hooks/use-organization'

type Organization = NonNullable<ReturnType<typeof useOrganization>['data']>
export type Member = Organization['members'][number]

export const membersColumns: ColumnDef<Member>[] = [
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
    cell: ({ row }) =>
      row.original.createdAt.toLocaleDateString('es-PE', {
        dateStyle: 'medium',
      }) || 'Desconocido',
  },
]

// Asume la importación de tu modelo de datos de actividad (ejemplo de tipado)
import type { ActivityModel } from '@api/modules/health/activity/model'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button' // Componente de UI
import { Checkbox } from '@workspace/ui/components/checkbox' // Componente Checkbox
import { ArrowUpDown } from 'lucide-react' // Icono de ordenamiento
import { useMemo } from 'react'

type Activity = ActivityModel.GetActivities['data'][number]

const activityTableColumns: ColumnDef<Activity>[] = [
  {
    // Columna de selección
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    // Columna 2: Nombre de la Actividad
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Actividad
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Button asChild variant="link">
        <Link
          to="/health/activities/$activityId"
          params={{ activityId: row.original.id.toString() }}
        >
          {row.original.name}
        </Link>
      </Button>
    ),
  },
  {
    // Columna 3: Duración de la actividad
    accessorKey: 'duration',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Duración
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => `${row.original.duration} h`,
  },
  {
    // Columna 4: Tipo de actividad
    accessorKey: 'type',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.typeName,
  },
  {
    // Columna 5: Organización de la Actividad
    accessorKey: 'spaceName', // Asume que este campo existe en el modelo
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Organización
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.spaceName,
  },
  {
    // Columna 5: Organización de la Actividad
    accessorKey: 'district', // Asume que este campo existe en el modelo
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Distrito
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.district,
  },
  {
    // Columna 6: Fecha de la Actividad
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    // Columna 7: Estado de la Actividad
    accessorKey: 'state',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Estado
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.statusName,
  },
]

/**
 * Hook para memoizar las definiciones de columnas de la tabla de actividades.
 * @returns ColumnDef<Activity>[]
 */
export const useColumnDefs = () => {
  return useMemo(() => activityTableColumns, [])
}

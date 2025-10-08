// Asume la importación de tu modelo de datos de actividad (ejemplo de tipado)
import type { ActivityModel } from '@api/modules/health/activity/model'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button' // Componente de UI
import { ArrowUpDown } from 'lucide-react' // Icono de ordenamiento
import { useMemo } from 'react'

// Define el tipo de dato de la fila (Activity)
type Activity = ActivityModel.GetActivities['data'][number]

const activityTableColumns: ColumnDef<Activity>[] = [
  {
    // Columna 1: Nombre de la Actividad
    accessorKey: 'name', // Debe coincidir con el campo de la API para ordenar (e.g., 'name')
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Actividad
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.name,
  },
  {
    // Columna 2: Duración de la actividad
    accessorKey: 'name', // Debe coincidir con el campo de la API para ordenar (e.g., 'duracion')
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Duración
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.duration,
  },
  {
    // Columna 3: Tipo de Actividad
    accessorKey: 'spaceName', // Asume que este campo existe en el modelo
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.spaceName,
  },
  {
    // Columna 4: Fecha de la Actividad
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
    // Formatea la fecha para mejor visualización (asume que 'date' es un string ISO)
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  // Aquí podrías añadir más columnas como 'responsibleUser', 'status', etc.
]

/**
 * Hook para memoizar las definiciones de columnas de la tabla de actividades.
 * @returns ColumnDef<Activity>[]
 */
export const useColumnDefs = () => {
  // Memoiza las columnas para optimizar el rendimiento de la tabla
  return useMemo(() => activityTableColumns, [])
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { useState } from 'react'
import { ActivityTable } from './components/activity-table' // Nuestro componente principal de la tabla
// Asumimos un componente de búsqueda similar al de tu compañero
//import SearchActivities from './components/search-activities'
import { useActivityTable } from './hooks/use-activity-table'

export default function ActivityPage() {
  // Estado local que no va en la URL (selección de filas)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  // Hook que maneja el fetching de datos, la paginación, el ordenamiento y los filtros de la URL
  const {
    data: activities, // Datos ya filtrados y paginados (servidor)
    isLoading, // Estado de carga
  } = useActivityTable()

  // Nota: Omitimos la lógica de filtros locales (uniqueScholarships, filteredRecipients)
  // ya que no aplicaría a las Actividades a menos que se definan filtros de lado del cliente.

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="w-full flex gap-8">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Actividades de Salud</CardTitle>
            <CardDescription>
              Aquí podrá visualizar todas las actividades de salud.
            </CardDescription>
          </CardHeader>

          <div className="flex flex-row justify-between pt-4 pb-2">
            <div className="flex-1 px-10">
              {/* Asumimos que SearchActivities recibe setFilt  ers para actualizar el filtro 'q' en la URL.
                Este componente debe llamar a: setFilters({ q: inputValue })
              */}
            </div>
            {/* Aquí irían otros filtros SelectFilters si fueran necesarios para el lado del cliente o servidor */}
          </div>

          <CardContent className="px-10">
            {/* Si el hook indica que está cargando o no hay datos, muestra un placeholder */}
            {isLoading || !activities ? (
              <div className="flex justify-center items-center h-48">
                Cargando actividades...
              </div>
            ) : (
              // Componente principal de la tabla, con todos los estados y setters
              <ActivityTable
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

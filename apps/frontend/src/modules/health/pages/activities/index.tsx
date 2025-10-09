import { useState } from 'react'
import { ActivityTable } from './components/activity-table'
import { useActivityTable } from './hooks/use-activity-table'

export default function ActivityPage() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const { data: activities, isLoading } = useActivityTable()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="w-full flex gap-8">
        <article className="flex flex-1 flex-col">
          <header>
            <h2 className="text-2xl font-bold leading-tight">
              Actividades de Salud
            </h2>
            <p>Aquí podrá visualizar todas las actividades de salud.</p>
          </header>

          <div className="flex flex-row justify-between pt-4 pb-2">
            <div className="flex-1 px-10"></div>
          </div>

          <div className="px-10">
            {isLoading || !activities ? (
              <div className="flex justify-center items-center h-48">
                Cargando actividades...
              </div>
            ) : (
              <ActivityTable
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

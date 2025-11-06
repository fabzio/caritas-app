import { useFilters } from '@frontend/hooks/use-filters'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { SquareActivity } from 'lucide-react'
import { useCallback, useState } from 'react'
import ActionsButton from './components/actions-button'
import { ActivityTable } from './components/activity-table'
import DateRangeFilter from './components/date-range-filter'
import RegionFilter from './components/region-filter'
import SearchActivityInput from './components/search-activity-input'
import { exportActivitiesDetailCsv } from './hooks/use-activity-detail-export'
import { useActivityTable } from './hooks/use-activity-table'
import { useDeleteActivities } from './hooks/use-delete-activities'

export default function ActivityPage() {
  const navigate = useNavigate()
  const { filters: rawFilters } = useFilters(
    '/_authenticated/health/activities/',
  )
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const { data: activities, isLoading } = useActivityTable()
  const { mutate: deleteActivities, isPending: isDeleting } =
    useDeleteActivities()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedActivities = selectedRows
    .map((rowIndex) => activities?.[rowIndex])
    .filter((activity): activity is NonNullable<typeof activity> =>
      Boolean(activity),
    )

  const activityCount = selectedActivities.length

  const handleDelete = async () => {
    const ids = selectedActivities.map((activity) => activity.id)
    deleteActivities(ids, {
      onSuccess: () => {
        setIsDeleteModalOpen(false)
        setRowSelection({})
      },
    })
  }

  const handleEdit = () => {
    if (activityCount === 1) {
      const activityId = selectedActivities[0].id
      navigate({ to: `/health/activities/edit/${activityId}` })
    }
  }

  const handleExportCsv = useCallback(async () => {
    const query: { [key: string]: string | number } = {}

    if (activityCount > 0) {
      const idsToExport = selectedActivities.map((activity) => activity.id)
      query.activityIds = idsToExport.join(',')
    } else {
      if (rawFilters.q) query.q = rawFilters.q
      if (rawFilters.regionIds) query.regionIds = rawFilters.regionIds
      if (rawFilters.startDate) query.startDate = rawFilters.startDate
      if (rawFilters.endDate) query.endDate = rawFilters.endDate

      query.filterOnly = 'true'
    }
    await exportActivitiesDetailCsv(query)
  }, [activityCount, selectedActivities, rawFilters])

  return (
    <div className="w-full p-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold leading-tight">
          Administración de Actividades de Salud
        </h2>
        <p className="text-muted-foreground">
          Aquí podrá visualizar todas las actividades de salud.
        </p>
      </header>

      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex-1 w-full">
            <SearchActivityInput />
          </div>
          <div className="flex w-auto gap-1">
            <DateRangeFilter />
            <RegionFilter />
          </div>
          <div className="flex items-center gap-2">
            <ActionsButton
              onDeleteClick={() => setIsDeleteModalOpen(true)}
              onEditClick={handleEdit}
              onExportCsvClick={handleExportCsv}
              selectedCount={activityCount}
            />
            <Link to="/health/activities/form">
              <Button>
                <SquareActivity />
                Nueva actividad
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4">
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

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {`¿Seguro que desea eliminar ${activityCount} actividad${activityCount === 1 ? '' : 'es'}?`}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isDeleting}>
                Cancelar
              </Button>
            </DialogClose>

            <Button type="button" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Aceptar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

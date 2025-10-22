import { Button } from '@workspace/ui/components/button'
import { HeartPlus } from 'lucide-react'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import DeleteConfirmationDialog from './components/delete-confirmation-dialog'
import SearchSpecialityInput from './components/search-speciality-input'
import SpecialityFormDialog from './components/speciality-form-dialog'
import SpecialityTable from './components/speciality-table'
import { useSpecialityTable } from './hooks/use-table'
import type { Speciality } from './models/speciality'

export default function Specialities() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editSelected, setEditSelected] = useState<Speciality | null>(null)

  const {
    data: specialities,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useSpecialityTable()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedSpecialities = selectedRows
    .map((rowIndex) => specialities?.[rowIndex])
    .filter(Boolean) as Speciality[]

  const selectedIds = selectedSpecialities
    ? selectedSpecialities.map((s) => s.id)
    : []
  const selectedCount = selectedIds.length

  const clearSelection = () => {
    setRowSelection({})
  }

  const handleDelete = () => {
    setDeleteOpen(true)
  }

  const handleEdit = () => {
    const item = selectedSpecialities[0]
    if (!item) return
    setEditSelected(item)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditSelected(null)
    setFormOpen(true)
  }

  return (
    <div className="w-full p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Administración de especialidades
        </h1>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="w-1/3">
          <SearchSpecialityInput />
        </div>

        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={handleDelete}
            onEditClick={handleEdit}
            selectedCount={selectedCount}
          />

          <Button onClick={handleNew}>
            <HeartPlus className="mr-1 w-4 h-4" />
            Nueva especialidad
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <SpecialityTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          data={specialities || []}
          columns={columns}
          paginationState={paginationState}
          sortingState={sortingState}
          setFilters={setFilters}
          pagination={pagination}
        />
      </div>

      <SpecialityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editSelected || undefined}
        clearSelection={clearSelection}
      />

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        selectedCount={selectedCount}
        ids={selectedIds}
        clearSelection={clearSelection}
      />
    </div>
  )
}

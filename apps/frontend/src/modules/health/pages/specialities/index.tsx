import { Button } from '@workspace/ui/components/button'
import { HeartPlus } from 'lucide-react'
import { useState } from 'react'
import SpecialityFormDialog from '../../components/speciality-form-dialog'
import ActionsButton from './components/actions-button'
import DeleteConfirmationDialog from './components/delete-confirmation-dialog'
import SearchSpecialityInput from './components/search-speciality-input'
import SpecialityTable from './components/speciality-table'
import { useSpecialityTable } from './hooks/use-table'
import type { Speciality } from './models/speciality-form'

export default function Specialities() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingSpeciality, setEditingSpeciality] = useState<Speciality | null>(
    null,
  )

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

  const selectedIds = selectedSpecialities.map((s) => s.id)
  const selectedCount = selectedIds.length
  const editSpeciality = selectedSpecialities[0]

  const clearSelection = () => setRowSelection({})

  const handleDelete = () => setDeleteOpen(true)

  const handleEdit = () => {
    if (!editSpeciality) return
    setEditingSpeciality(editSpeciality)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditingSpeciality(null)
    setFormOpen(true)
  }

  const handleFormOpenChange = (open: boolean) => {
    if (!open) setEditingSpeciality(null)
    setFormOpen(open)
  }

  return (
    <div className="w-full p-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold leading-tight">Especialidades</h2>
        <p className="text-muted-foreground">
          Aquí podrá visualizar todas las especialidades por ofrecer en
          atención.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        <div className="flex-1 w-full">
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
        onOpenChange={handleFormOpenChange}
        speciality={editingSpeciality}
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

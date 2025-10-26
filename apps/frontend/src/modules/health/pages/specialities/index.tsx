import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { HeartPlus } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import ActionsButton from './components/actions-button'
import DeleteConfirmationDialog from './components/delete-confirmation-dialog'
import SearchSpecialityInput from './components/search-speciality-input'
import SpecialityFormDialog from './components/speciality-form-dialog'
import SpecialityTable from './components/speciality-table'
import usePostSpeciality from './hooks/use-post-speciality'
import { useSpecialityTable } from './hooks/use-table'
import useUpdateSpeciality from './hooks/use-update-speciality'
import type { Speciality } from './models/speciality'
import {
  type FormSpecialitySchema,
  formSpecialitySchema,
} from './models/speciality-form'

export default function Specialities() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const modeRef = useRef<'new' | 'edit'>('new')

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

  const form = useForm<FormSpecialitySchema>({
    resolver: zodResolver(formSpecialitySchema),
    defaultValues: { name: '' },
  })

  const { mutate: createSpeciality, isPending: isCreating } =
    usePostSpeciality()
  const { mutate: updateSpeciality, isPending: isUpdating } =
    useUpdateSpeciality()

  const handleSubmit = form.handleSubmit((data) => {
    if (modeRef.current === 'edit') {
      updateSpeciality(
        { id: editSpeciality.id, name: data.name },
        { onSuccess: () => handleFormOpenChange(false) },
      )
    } else {
      createSpeciality(data, { onSuccess: () => handleFormOpenChange(false) })
    }
  })

  const clearSelection = () => setRowSelection({})

  const handleDelete = () => setDeleteOpen(true)

  const handleEdit = () => {
    modeRef.current = 'edit'
    form.reset({ name: editSpeciality.name })
    setFormOpen(true)
  }

  const handleNew = () => {
    modeRef.current = 'new'
    form.reset({ name: '' })
    setFormOpen(true)
  }

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({ name: '' })
      modeRef.current = 'new'
    }
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
        form={form}
        handleSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        viewType={modeRef.current}
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

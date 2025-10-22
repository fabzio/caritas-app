import { Link } from '@tanstack/react-router'
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
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import OrganizationFormDialog from './components/organization-form-dialog'
import OrganizationTable from './components/organization-table'
import SearchHealthOrganizationInput from './components/search-organization-input'
import { useOrganizationTable } from './hooks/use-organization-table'

interface FormModalStateType {
  open: boolean
  type: 'new' | 'edit'
}

export default function AlliesTableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formModal, setFormModal] = useState<FormModalStateType>({
    open: false,
    type: 'new',
  })

  const {
    data: allies,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useOrganizationTable()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedAllies = selectedRows
    .map((rowIndex) => allies?.[rowIndex])
    .filter((ally): ally is NonNullable<typeof ally> => Boolean(ally))

  const allyCount = selectedAllies.length

  const handleDelete = async () => {
    // TODO: implement delete ally
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex-1 w-full">
            <SearchHealthOrganizationInput />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            onEditClick={() => setFormModal({ open: true, type: 'edit' })}
            selectedCount={allyCount}
          />
          <Button onClick={() => setFormModal({ open: true, type: 'new' })}>
            <UserPlus />
            Nuevo aliado
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <OrganizationTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          data={allies || []}
          columns={columns}
          paginationState={paginationState}
          sortingState={sortingState}
          setFilters={setFilters}
          pagination={pagination}
        />
      </div>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {`¿Seguro que desea eliminar ${allyCount} organizaci${allyCount !== 1 ? 'ones' : 'ón'}?`}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button type="button" onClick={handleDelete}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal para crear/editar */}
      <OrganizationFormDialog
        open={formModal.open}
        onOpenChange={setFormModal}
        initialData={selectedAllies[0] || undefined}
      />
    </div>
  )
}

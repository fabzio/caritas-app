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
import { ChevronDown, UserPlus } from 'lucide-react'
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

export default function OrganizationTableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formModal, setFormModal] = useState<FormModalStateType>({
    open: false,
    type: 'new',
  })

  const {
    data: organizations,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useOrganizationTable()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedOrganizations = selectedRows
    .map((rowIndex) => organizations?.[rowIndex])
    .filter((organization): organization is NonNullable<typeof organization> =>
      Boolean(organization),
    )

  const organizationCount = selectedOrganizations.length

  const handleDelete = async () => {
    // TODO: implement delete organization
  }

  return (
    <div className="w-full p-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold leading-tight">
          Administración de organizaciones aliadas
        </h2>
        <p className="text-muted-foreground">
          Aquí podrá visualizar todas las organizaciones aliadas de educación.
        </p>
      </header>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="w-full">
          <div className="flex-1 w-full">
            <SearchHealthOrganizationInput />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            onEditClick={() => setFormModal({ open: true, type: 'edit' })}
            selectedCount={organizationCount}
          />
          <Button onClick={() => setFormModal({ open: true, type: 'new' })}>
            <UserPlus />
            Nueva organización
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <OrganizationTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          data={organizations || []}
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
              {`¿Seguro que desea eliminar ${organizationCount} organizaci${organizationCount === 1 ? 'ón' : 'ones'}?`}
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
        initialData={selectedOrganizations[0] || undefined}
      />
    </div>
  )
}

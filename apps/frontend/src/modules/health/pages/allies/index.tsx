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
import OrganizationFormDialog from '../../components/organization-form-dialog'
import ActionsButton from './components/actions-button'
import DeleteConfirmationDialog from './components/delete-confirmation-dialog'
import OrganizationTable from './components/organization-table'
import SearchHealthOrganizationInput from './components/search-organization-input'
import { useOrganizationTable } from './hooks/use-ally-table'
import type { Organization } from './hooks/use-list-ally'

export default function AlliesTableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAlly, setEditingAlly] = useState<Organization | null>(null)

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
    .filter(
      (ally): ally is NonNullable<typeof ally> =>
        ally !== undefined && ally !== null,
    )

  const allyCount = selectedAllies.length

  const selectedIds = selectedAllies ? selectedAllies.map((s) => s.id) : []
  const selectedCount = selectedIds.length

  const handleDelete = () => {
    setDeleteOpen(true)
  }
  const clearSelection = () => {
    setRowSelection({})
  }

  const handleEdit = () => {
    const ally = selectedAllies[0]
    if (!ally) return
    setEditingAlly(ally)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditingAlly(null)
    setFormOpen(true)
  }

  const handleFormOpenChange = (open: boolean) => {
    if (!open) setEditingAlly(null)
    setFormOpen(open)
  }

  return (
    <div className="w-full p-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold leading-tight">
          Administración de Organizaciones Aliadas
        </h2>
        <p className="text-muted-foreground">
          Aquí podrá visualizar todas las organizaciones aliadas de servicios de
          salud.
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
            onDeleteClick={() => setDeleteOpen(true)}
            onEditClick={handleEdit}
            selectedCount={allyCount}
          />
          <Button onClick={handleNew}>
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
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {`¿Seguro que desea eliminar ${allyCount} organizaci${allyCount === 1 ? 'ón' : 'ones'}?`}
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
      <OrganizationFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        ally={editingAlly ?? undefined}
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

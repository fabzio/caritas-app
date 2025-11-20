import { useNavigate, useSearch } from '@tanstack/react-router'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { ChevronDown, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import ActionsButton from './components/actions-button'
import OrganizationFormDialog from './components/organization-form-dialog'
import OrganizationTable from './components/organization-table'
import SearchHealthOrganizationInput from './components/search-organization-input'
import useDeleteOrganizations from './hooks/use-delete-organizations'
import { useOrganizationTable } from './hooks/use-organization-table'

interface FormModalStateType {
  open: boolean
  type: 'new' | 'edit'
}

export default function OrganizationTableView() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/education/organization/' })
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formModal, setFormModal] = useState<FormModalStateType>({
    open: false,
    type: 'new',
  })

  // Open create modal when action=create parameter is present
  useEffect(() => {
    if (search.action === 'create') {
      setFormModal({ open: true, type: 'new' })
      // Clear the action parameter after opening
      navigate({
        to: '/education/organization',
        replace: true,
      })
    }
  }, [search.action, navigate])

  const deleteOrganizations = useDeleteOrganizations()

  const {
    data: organizations,
    pagination,
    columns,
    paginationState,
    sortingState,
    filters,
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
    const ids = selectedOrganizations.map((org) => org.id)

    deleteOrganizations.mutate(
      { ids },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false)
          setRowSelection({})
        },
      },
    )
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filters.active === undefined
                  ? 'Todas'
                  : filters.active
                    ? 'Activas'
                    : 'Inactivas'}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setRowSelection({})
                  setFilters({ active: undefined, pageIndex: 1 })
                }}
              >
                Todas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setRowSelection({})
                  setFilters({ active: true, pageIndex: 1 })
                }}
              >
                Activas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setRowSelection({})
                  setFilters({ active: false, pageIndex: 1 })
                }}
              >
                Inactivas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <Button
                type="button"
                variant="outline"
                disabled={deleteOrganizations.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleteOrganizations.isPending}
            >
              {deleteOrganizations.isPending ? 'Eliminando...' : 'Aceptar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrganizationFormDialog
        open={formModal.open}
        onOpenChange={setFormModal}
        initialData={selectedOrganizations[0] || undefined}
      />
    </div>
  )
}

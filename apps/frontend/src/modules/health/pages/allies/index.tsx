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
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import CreateAlly from './components/create-ally'
import OrganizationTable from './components/organization-table'
import SearchHealthOrganizationInput from './components/search-organization-input'
import { useOrganizationTable } from './hooks/use-organization-table'

export default function AlliesTableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

  const userCount = selectedAllies.length

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
            onEditClick={() => {}}
            selectedCount={userCount}
          />
          <CreateAlly viewType="new" />
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
              {`¿Seguro que desea eliminar ${userCount} organizaci${userCount === 1 ? 'ón' : 'ones'}?`}
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
    </div>
  )
}

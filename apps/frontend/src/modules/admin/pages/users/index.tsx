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
import { Input } from '@workspace/ui/components/input'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import UserTable from './components/user-table'
import { useRemoveUser } from './hooks/use-remove-user'

export default function User() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { mutateAsync: removeUser, isPending } = useRemoveUser()
  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))
  const resetSelectedRows = () => setRowSelection({})

  const userCount = selectedRows.length

  const handleDelete = async () => {
    await Promise.all(
      selectedRows.map((rowId) => removeUser({ userId: rowId.toString() })),
    )
    setIsDeleteModalOpen(false)
    resetSelectedRows()
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <Input
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            selectedCount={userCount}
          />
          <Button>
            <UserPlus />
            Nuevo usuario
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <UserTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          search={searchTerm}
        />
      </div>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {`¿Seguro que desea eliminar ${userCount} usuario${userCount !== 1 ? 's' : ''}?`}
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

            <Button type="button" onClick={handleDelete} disabled={isPending}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

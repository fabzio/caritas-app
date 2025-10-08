import { Button } from '@workspace/ui/components/button'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import UserTable from './components/user-table'

export default function User() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const _selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))
  const _resetSelectedRows = () => setRowSelection({})
  return (
    <div className="w-full p-4">
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-2">
          <ActionsButton />
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
        />
      </div>
    </div>
  )
}

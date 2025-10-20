import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { HeartPlus, Search } from 'lucide-react'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import SpecialityTable from './components/speciality-table'
import { useSpecialityTable } from './hooks/use-table'

export default function Speciality() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data: specialities } = useSpecialityTable(search)

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedSpecialities = selectedRows
    .map((rowIndex) => specialities?.[rowIndex])
    .filter(Boolean)

  const selectedCount = selectedSpecialities.length

  const handleEdit = () => {
    const selected = selectedSpecialities[0]

    navigate({
      to: '/health/speciality/form',
      search: { id: String(selected.id), type: 'edit' },
    })
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
          <div className="relative">
            <Input
              placeholder="Buscar especialidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search size={18} />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => {}}
            onEditClick={handleEdit}
            selectedCount={selectedCount}
          />

          <Link to="/health/speciality/form" search={{ type: 'new' }}>
            <Button>
              <HeartPlus className="mr-1 w-4 h-4" />
              Nueva especialidad
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <SpecialityTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          search={search}
        />
      </div>
    </div>
  )
}

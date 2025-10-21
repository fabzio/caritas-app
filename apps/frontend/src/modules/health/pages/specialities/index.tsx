import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { HeartPlus } from 'lucide-react'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import SearchSpecialityInput from './components/search-speciality-input'
import SpecialityTable from './components/speciality-table'
import { useSpecialityTable } from './hooks/use-table'

export default function Speciality() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()

  const {
    data: specialities,
    pagination,
    columns,
    paginationState,
    sortingState,
    filters,
    setFilters,
  } = useSpecialityTable()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedSpecialities = selectedRows
    .map((rowIndex) => specialities?.[rowIndex])
    .filter(Boolean)

  const selectedCount = selectedSpecialities.length

  const handleEdit = () => {
    const selected = selectedSpecialities[0]
    if (!selected) return

    navigate({
      to: '/health/specialities/form',
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
            <SearchSpecialityInput />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ActionsButton
            onDeleteClick={() => {}}
            onEditClick={handleEdit}
            selectedCount={selectedCount}
          />

          <Link to="/health/specialities/form" search={{ type: 'new' }}>
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
          data={specialities || []}
          columns={columns}
          paginationState={paginationState}
          sortingState={sortingState}
          setFilters={setFilters}
          pagination={pagination}
        />
      </div>
    </div>
  )
}

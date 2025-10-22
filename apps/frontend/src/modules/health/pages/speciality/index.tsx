import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { HeartPlus, Search } from 'lucide-react'
import { useState } from 'react'
import CreateSpeciality from './components/create-speciality'
import SpecialityTable from './components/speciality-table'

export default function Speciality() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')

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

        <CreateSpeciality />
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

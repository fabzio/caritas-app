import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { HeartPlus } from 'lucide-react'
import { useState } from 'react'
import SpecialityTable from './components/speciality-table'

export default function Speciality() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  return (
    <div className="w-full p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Administración de especialidades
        </h1>
      </div>
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-2">
          <Link to="/health/speciality/create">
            <Button>
              <HeartPlus />
              Nueva especialidad
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <SpecialityTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  )
}

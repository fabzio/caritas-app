import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { SearchIcon } from 'lucide-react'
import { useState } from 'react'
import RecipientsTable from './components/recipients-table'

export default function ScholarshipRecipients() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="w-full flex gap-8">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Becados</CardTitle>
            <CardDescription>
              Aquí podrás visualizar a todos los alumnos becados.
            </CardDescription>
          </CardHeader>
          <div className="px-10">
            <SearchIcon className="absolute ml-3 mt-2.5 h-5 w-5" />
            <Input
              placeholder="Buscar becado por nombre o nro. de documento..."
              className="w-1/3 pl-10"
              inputMode="search"
            />
          </div>
          <CardContent className="px-10">
            <RecipientsTable
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

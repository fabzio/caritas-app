import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { useState } from 'react'
import RecipientsTable from './components/recipients-table'

export default function Scholarship() {
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
          <CardContent className="px-0">
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

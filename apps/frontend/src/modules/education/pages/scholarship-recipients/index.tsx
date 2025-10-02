import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { useState } from 'react'
import RecipientsTable from './components/recipients-table'
import SearchRecipients from './components/search-recipients'

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
            <SearchRecipients />
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

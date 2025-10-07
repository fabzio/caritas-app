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
import { useScholarshipRecipientTable } from './hooks/use-scholarship-table'

export default function ScholarshipRecipients() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const {
    data: recipients,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useScholarshipRecipientTable()

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
              data={recipients || []}
              columns={columns}
              paginationState={paginationState}
              sortingState={sortingState}
              setFilters={setFilters}
              pagination={pagination}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

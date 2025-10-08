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
import SelectFilters from './components/select-filters'
import { useScholarshipRecipientTable } from './hooks/use-scholarship-table'
import { useSelectNames } from './hooks/use-select-names'

export default function ScholarshipRecipients() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const {
    data: recipients,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
    filters,
  } = useScholarshipRecipientTable()

  const { data: selectNames } = useSelectNames()
  const scholarshipNames = selectNames?.scholarshipNames ?? []
  const regionNames = selectNames?.regionNames ?? []

  const scholarshipFilter = filters.selectFilters?.scholarshipName || 'all'
  const handleScholarshipFilterChange = (newScholarshipName: string) => {
    setRowSelection({})
    setFilters({
      selectFilters: {
        ...filters.selectFilters,
        scholarshipName:
          newScholarshipName === 'all' ? undefined : newScholarshipName,
        regionNames: filters.selectFilters?.regionNames,
      },
      pageIndex: 1,
    })
  }

  const regionFilter = filters.selectFilters?.regionNames || 'all'
  const handleRegionFilterChange = (newRegionName: string) => {
    setRowSelection({})
    setFilters({
      selectFilters: {
        ...filters.selectFilters,
        regionNames: newRegionName === 'all' ? undefined : newRegionName,
        scholarshipName: filters.selectFilters?.scholarshipName,
      },
      pageIndex: 1,
    })
  }

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
          <div className="flex flex-row justify-between pt-4 pb-2">
            <div className="flex-1 px-10">
              <SearchRecipients />
            </div>
            <div className="flex flex-row gap-4 px-10">
              <SelectFilters
                value={regionFilter}
                onValueChange={handleRegionFilterChange}
                valueList={regionNames}
                item="región"
                placeholder="Todas las regiones"
              />
              <SelectFilters
                value={scholarshipFilter}
                onValueChange={handleScholarshipFilterChange}
                valueList={scholarshipNames}
                placeholder="Todas las becas"
                item="beca"
              />
            </div>
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

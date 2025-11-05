import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import RecipientsTable from './components/recipients-table'
import SearchRecipients from './components/search-recipients'
import SelectFilters from './components/select-filters'
import { useScholarshipRecipientTable } from './hooks/use-scholarship-table'
import { useSelectNames } from './hooks/use-select-names'

export default function ScholarshipRecipients() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const isMobile = useIsMobile()

  const {
    isLoading,
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
        <div className="flex flex-1 flex-col">
          <header className="mb-6">
            <h2 className="text-2xl font-bold leading-tight">
              Administración de becados
            </h2>
            <p className="text-muted-foreground">
              Aquí podrá visualizar todos los beneficiarios registrados.
            </p>
          </header>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex-1">
              <SearchRecipients />
            </div>
            <div className="flex flex-row gap-4 px-10">
              <SelectFilters
                value={regionFilter}
                onValueChange={handleRegionFilterChange}
                valueList={regionNames}
                item="distrito"
                placeholder="Todos los distritos"
              />
              <SelectFilters
                value={scholarshipFilter}
                onValueChange={handleScholarshipFilterChange}
                valueList={scholarshipNames}
                placeholder="Todas las becas"
                item="beca"
              />
              <Link to="/education/recipients/create">
                <Button
                  className="whitespace-nowrap"
                  size={isMobile ? 'sm' : 'lg'}
                >
                  <PlusCircle />
                  Agregar becado
                </Button>
              </Link>
            </div>
          </div>
          <div className="">
            <RecipientsTable
              isLoading={isLoading}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              data={recipients || []}
              columns={columns}
              paginationState={paginationState}
              sortingState={sortingState}
              setFilters={setFilters}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

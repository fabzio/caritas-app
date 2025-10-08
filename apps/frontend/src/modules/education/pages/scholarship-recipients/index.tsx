import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { useMemo, useState } from 'react'
import RecipientsTable from './components/recipients-table'
import SearchRecipients from './components/search-recipients'
import SelectFilters from './components/select-filters'
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

  const [scholarshipFilter, setScholarshipFilter] = useState<string>('all')

  const uniqueScholarships = useMemo(() => {
    if (!recipients) return []
    const scholarships = recipients
      .map((recipient) => recipient.scholarshipName)
      .filter(
        (scholarship): scholarship is string =>
          scholarship !== null && scholarship !== undefined,
      )
    return Array.from(new Set(scholarships)).sort((a, b) =>
      a.localeCompare(b, 'es'),
    )
  }, [recipients])

  const [regionFilter, setRegionFilter] = useState<string>('all')

  const uniqueRegions = useMemo(() => {
    if (!recipients) return []
    const regions = recipients
      .map((recipient) => recipient.region)
      .filter(
        (region): region is string => region !== null && region !== undefined,
      )
    return Array.from(new Set(regions)).sort((a, b) => a.localeCompare(b, 'es'))
  }, [recipients])

  const filteredRecipients = useMemo(() => {
    if (!recipients) return recipients
    return recipients.filter((recipient) => {
      const scholarshipMatch =
        scholarshipFilter === 'all' ||
        recipient.scholarshipName === scholarshipFilter
      const regionMatch =
        regionFilter === 'all' || recipient.region === regionFilter
      return scholarshipMatch && regionMatch
    })
  }, [recipients, scholarshipFilter, regionFilter])

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
                onValueChange={setRegionFilter}
                valueList={uniqueRegions}
                item="regiones"
              />
              <SelectFilters
                value={scholarshipFilter}
                onValueChange={setScholarshipFilter}
                valueList={uniqueScholarships}
                item="becas"
              />
            </div>
          </div>
          <CardContent className="px-10">
            <RecipientsTable
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              data={filteredRecipients || []}
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

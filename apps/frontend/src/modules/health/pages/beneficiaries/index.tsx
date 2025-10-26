import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import ActionsButton from './components/actions-button'
import BeneficiaryTable from './components/beneficiary-table'
import SearchBeneficiaryInput from './components/search-beneficiary-input'
import { useBeneficiaryTable } from './hooks/use-table'

export default function TableView() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const {
    data: beneficiaries,
    pagination,
    columns,
    paginationState,
    sortingState,
    setFilters,
  } = useBeneficiaryTable()

  const selectedRows = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number.parseInt(key, 10))

  const selectedBeneficiaries = selectedRows
    .map((rowIndex) => beneficiaries?.[rowIndex])
    .filter((beneficiary): beneficiary is NonNullable<typeof beneficiary> =>
      Boolean(beneficiary),
    )

  const beneficiaryCount = selectedBeneficiaries.length

  const navigate = useNavigate()

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <div className="flex-1 w-full">
            <SearchBeneficiaryInput />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionsButton
            onEditClick={() =>
              navigate({
                to: '/health/beneficiaries/form',
                search: { id: selectedBeneficiaries[0].id, type: 'edit' },
              })
            }
            selectedCount={beneficiaryCount}
          />
        </div>
      </div>
      <div className="mt-4">
        <BeneficiaryTable
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          data={beneficiaries || []}
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

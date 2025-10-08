import { useMemo, useState } from 'react'

export type Beneficiary = {
  id: string
  name: string
  documentNumber: string
}

const DUMMY_BENEFICIARIES: Beneficiary[] = [
  { id: 'BEN-001', name: 'María García López', documentNumber: '12345678A' },
  {
    id: 'BEN-002',
    name: 'Carlos Fernández Sánchez',
    documentNumber: '55667788D',
  },
  { id: 'BEN-003', name: 'Laura González Díaz', documentNumber: '99887766E' },
  { id: 'BEN-004', name: 'Isabel Moreno Castro', documentNumber: '33445566G' },
]

type UseBeneficiarySearchProps = {
  onSelect: (beneficiary: Beneficiary) => void
}

export function useBeneficiarySearch({ onSelect }: UseBeneficiarySearchProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBeneficiaries = useMemo(() => {
    if (!searchQuery) return DUMMY_BENEFICIARIES
    const query = searchQuery.toLowerCase()
    return DUMMY_BENEFICIARIES.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.documentNumber.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    onSelect(beneficiary)
    setSearchQuery('')
  }

  return {
    searchQuery,
    setSearchQuery,
    filteredBeneficiaries,
    handleSelectBeneficiary,
  }
}

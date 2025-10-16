import { useMemo, useState } from 'react'
import { type Beneficiary, useGetBeneficiaries } from './use-get-beneficiaries'

type UseBeneficiarySearchProps = {
  selectedBeneficiary: Beneficiary | null
  onSelect: (beneficiary: Beneficiary) => void
  onClear: () => void
}

export function useBeneficiarySearch({
  selectedBeneficiary,
  onSelect,
  onClear,
}: UseBeneficiarySearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: beneficiaries, isLoading } = useGetBeneficiaries()

  const filteredBeneficiaries = useMemo(() => {
    if (!beneficiaries) return []
    if (!searchQuery) return beneficiaries
    const query = searchQuery.toLowerCase()
    return beneficiaries.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.surname.toLowerCase().includes(query) ||
        b.documentNumber.toLowerCase().includes(query) ||
        b.documentType?.toLowerCase().includes(query),
    )
  }, [searchQuery, beneficiaries])

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    onSelect(beneficiary)
    setSearchQuery('')
  }

  const formatDocument = (beneficiary: Beneficiary) => {
    if (beneficiary.documentType) {
      return `${beneficiary.documentType} - ${beneficiary.documentNumber}`
    }
    return beneficiary.documentNumber
  }

  return {
    searchQuery,
    setSearchQuery,
    filteredBeneficiaries,
    handleSelectBeneficiary,
    selectedBeneficiary,
    onClear,
    formatDocument,
    isLoading,
  }
}

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  type Beneficiary,
  useGetBeneficiaries,
} from '../hooks/use-get-beneficiaries'

type BeneficiarySearchProps = {
  selectedBeneficiary: Beneficiary | null
  onSelect: (beneficiary: Beneficiary) => void
  onClear: () => void
}

export default function BeneficiarySearch({
  selectedBeneficiary,
  onSelect,
  onClear,
}: Readonly<BeneficiarySearchProps>) {
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

  if (selectedBeneficiary) {
    return (
      <div className="flex items-center justify-between rounded-md border p-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">
            {selectedBeneficiary.name} {selectedBeneficiary.surname}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatDocument(selectedBeneficiary)}
          </span>
        </div>
        <Button type="button" variant="ghost" onClick={onClear}>
          Cambiar
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o número de documento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      {searchQuery && (
        <div className="absolute z-50 w-full mt-2 rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
          {filteredBeneficiaries.length > 0 ? (
            <div className="divide-y">
              {filteredBeneficiaries.map((beneficiary) => (
                <button
                  key={beneficiary.id}
                  type="button"
                  onClick={() => handleSelectBeneficiary(beneficiary)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {beneficiary.name} {beneficiary.surname}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDocument(beneficiary)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No se encontraron beneficiarios
            </div>
          )}
        </div>
      )}
    </div>
  )
}

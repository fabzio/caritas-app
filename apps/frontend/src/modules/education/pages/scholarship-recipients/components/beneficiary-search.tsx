import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Search } from 'lucide-react'
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

  if (selectedBeneficiary) {
    return (
      <div className="flex items-center justify-between rounded-md border p-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{selectedBeneficiary.name}</span>
          <span className="text-sm text-muted-foreground">
            Documento: {selectedBeneficiary.documentNumber}
          </span>
        </div>
        <Button type="button" variant="ghost" onClick={onClear}>
          Cambiar
        </Button>
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
                    <span className="font-medium">{beneficiary.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {beneficiary.documentNumber}
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

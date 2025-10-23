import { Input } from '@workspace/ui/components/input'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface SearchAttentionInputProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function SearchAttentionInput({
  onSearch,
  placeholder = 'Buscar atención...',
}: Readonly<SearchAttentionInputProps>) {
  const [searchValue, setSearchValue] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch?.(value)
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        className="pl-10"
      />
    </div>
  )
}

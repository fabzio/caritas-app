import { Input } from '@workspace/ui/components/input'
import { SearchIcon } from 'lucide-react'
import { useFilters } from '@/hooks/use-filters'

export default function SearchRecipients() {
  const { setFilters } = useFilters('/_authenticated/education/recipients/')
  const onChangeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ q: e.target.value })
  }
  return (
    <>
      <SearchIcon className="absolute ml-3 mt-2.5 h-5 w-5" />
      <Input
        placeholder="Buscar becado por nombre, nro. de documento o beca..."
        className="w-1/3 pl-10"
        inputMode="search"
        onChange={onChangeFilter}
      />
    </>
  )
}

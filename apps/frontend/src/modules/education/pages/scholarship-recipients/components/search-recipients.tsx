import { useFilters } from '@frontend/hooks/use-filters'
import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'
import { SearchIcon } from 'lucide-react'

export default function SearchRecipients() {
  const { setFilters } = useFilters('/_authenticated/education/recipients/')
  const onChangeFilter = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ q: e.target.value })
  }, 300)
  return (
    <>
      {/* <SearchIcon className="absolute ml-3 mt-2 h-5 w-5" /> */}
      <Input
        placeholder="Buscar becado por nombre o nro. de documento..."
        // className="pl-10"
        inputMode="search"
        onChange={onChangeFilter}
      />
    </>
  )
}

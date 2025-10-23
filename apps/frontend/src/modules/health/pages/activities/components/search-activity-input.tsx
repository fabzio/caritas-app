import { useFilters } from '@frontend/hooks/use-filters'
import { Input } from '@workspace/ui/components/input'
import debounce from 'debounce'
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

type ResetFunction = () => void
type SearchActivityInputProps = {
  onClearRef: React.MutableRefObject<ResetFunction | null>
}
export default function SearchActivityInput({
  onClearRef,
}: SearchActivityInputProps) {
  const { filters, setFilters } = useFilters(
    '/_authenticated/health/activities/',
  )

  const [inputValue, setInputValue] = useState(filters.q || '')

  const debouncedSetFilter = useMemo(
    () =>
      debounce((value) => {
        setFilters({ q: value, page: 0 })
      }, 300),
    [setFilters],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    debouncedSetFilter(newValue)
  }

  const resetSearch = useCallback(() => {
    setInputValue('')
    setFilters({ q: undefined, page: 0 })
  }, [setFilters])

  useEffect(() => {
    onClearRef.current = resetSearch

    return () => {
      onClearRef.current = null
    }
  }, [onClearRef, resetSearch])

  return (
    <Input
      type="search"
      value={inputValue}
      placeholder="Buscar por nombre de actividad..."
      onChange={handleInputChange}
    />
  )
}

'use client'

import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Separator } from '@workspace/ui/components/separator'
import { cn } from '@workspace/ui/lib/utils'
import { Check, ChevronsUpDown, GraduationCap } from 'lucide-react'
import * as React from 'react'

type ScholarshipComboboxProps = {
  readonly value?: string
  readonly onChange: (value: string) => void
  readonly scholarships: ReadonlyArray<{ id: number; name: string }>
  readonly isLoading: boolean
}

export function ScholarshipCombobox({
  value,
  onChange,
  scholarships,
  isLoading,
}: ScholarshipComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filtered = React.useMemo(
    () =>
      scholarships.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [scholarships, search],
  )

  const selected = React.useMemo(
    () => scholarships.find((s) => String(s.id) === value),
    [scholarships, value],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-[300px] justify-between"
          disabled={isLoading}
        >
          {isLoading
            ? 'Cargando becas...'
            : (selected?.name ?? 'Seleccione una beca')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar beca..."
            value={search}
            onValueChange={setSearch}
            className="h-9 px-2"
          />
          <CommandList className="p-0! m-0!">
            <CommandEmpty className="p-0!">
              {scholarships.length === 0 ? (
                <div className="flex flex-col items-center gap-0.5 py-1.5 text-sm text-muted-foreground">
                  <span className="text-center leading-tight">
                    No hay becas disponibles.
                  </span>
                  <Separator className="my-0.5 w-3/4" />
                  <Link
                    to="/education/scholarship/form"
                    search={{ type: 'new' }}
                    className="inline-flex items-center gap-1 underline text-foreground hover:text-primary transition-colors"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>Agregar nueva beca</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-center py-1.5 text-sm text-muted-foreground">
                  No se encontraron resultados
                </div>
              )}
            </CommandEmpty>

            <CommandGroup>
              {filtered.map((s) => (
                <CommandItem
                  key={s.id}
                  value={String(s.id)}
                  onSelect={(val) => {
                    onChange(val)
                    setOpen(false)
                  }}
                  className="text-sm"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 transition-opacity',
                      value === String(s.id) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{s.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

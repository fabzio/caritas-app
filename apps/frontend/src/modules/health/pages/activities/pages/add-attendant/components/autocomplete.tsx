import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { cn } from '@workspace/ui/lib/utils'
import { Command as CommandPrimitive } from 'cmdk'
import { Check } from 'lucide-react'
import { type KeyboardEvent, useCallback, useRef, useState } from 'react'
import type { ExistentUsers } from '../hooks/use-list-users-autocomplete'

export type Option = Record<'value' | 'label', string> & Record<string, string>

type AutoCompleteProps = {
  options: ExistentUsers[]
  emptyMessage: string
  value?: ExistentUsers
  nonSelectedValue?: string
  onValueChange?: (value: ExistentUsers) => void
  onInputChange?: (value: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export const AutoComplete = ({
  options,
  placeholder,
  emptyMessage,
  value,
  nonSelectedValue,
  onValueChange,
  onInputChange,
  disabled,
  isLoading = false,
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)
  const [selected, setSelected] = useState<ExistentUsers | undefined>(
    value as ExistentUsers,
  )
  const [nonSelected, setNonSelected] = useState<string>(
    nonSelectedValue as string,
  )
  const [inputValue, setInputValue] = useState<string>(
    value?.documentNumber || '',
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (!input) {
        return
      }

      if (!isOpen) {
        setOpen(true)
      }

      if (event.key === 'Enter' && input.value !== '') {
        const optionToSelect = options.find(
          (option) => option.documentNumber === input.value,
        )
        if (optionToSelect) {
          setSelected(optionToSelect)
          onValueChange?.(optionToSelect)
        }
      }

      if (event.key === 'Escape') {
        input.blur()
      }
    },
    [isOpen, options, onValueChange],
  )

  const handleBlur = useCallback(() => {
    setOpen(false)
  }, [])

  const handleSelectOption = useCallback(
    (selectedOption: ExistentUsers) => {
      setInputValue(selectedOption.documentNumber)

      setSelected(selectedOption)
      onValueChange?.(selectedOption)

      setOpen(false)
      setTimeout(() => {
        inputRef?.current?.blur()
      }, 0)
    },
    [onValueChange],
  )
  const handleInputChange = (val: string) => {
    setInputValue(val)
    setNonSelected(val)
    onInputChange?.(val)
    setSelected(undefined)
  }

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <CommandInput
        ref={inputRef}
        value={inputValue}
        onValueChange={isLoading ? undefined : handleInputChange}
        onBlur={handleBlur}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <div className="relative mt-1">
        <div
          className={cn(
            'animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-popover outline-none',
            isOpen ? 'block' : 'hidden',
          )}
        >
          <CommandList>
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {options.length > 0 && !isLoading ? (
              <CommandGroup heading={`Beneficiarios encontrados`}>
                {options.map((option) => {
                  const isSelected = selected?.id === option.id
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.documentNumber}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      onSelect={() => handleSelectOption(option)}
                    >
                      {isSelected ? <Check className="w-4" /> : null}
                      <span>
                        {option.name} {option.surname}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {option.documentType} - {option.documentNumber}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}
            {!isLoading ? (
              <CommandEmpty>
                <div className="px-2">{emptyMessage}</div>
              </CommandEmpty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  )
}

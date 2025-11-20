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
import type { AcceptedUser } from '../hooks/use-accept-applications'

type AutoCompleteAcceptedUserProps = {
  options: AcceptedUser[]
  emptyMessage: string
  value?: AcceptedUser
  nonSelectedValue?: string
  onValueChange?: (value: AcceptedUser) => void
  onInputChange?: (value: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export const AutoCompleteAcceptedUser = ({
  options,
  placeholder,
  emptyMessage,
  value,
  nonSelectedValue,
  onValueChange,
  onInputChange,
  disabled,
  isLoading = false,
}: AutoCompleteAcceptedUserProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setOpen] = useState(false)

  const selected = value
  const inputValue = value?.name || nonSelectedValue || ''

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (!input) return
      if (!isOpen) setOpen(true)

      if (event.key === 'Enter' && input.value !== '') {
        const optionToSelect = options.find(
          (option) =>
            option.name.toLowerCase() === input.value.toLowerCase() ||
            option.email.toLowerCase() === input.value.toLowerCase(),
        )
        if (optionToSelect) {
          onValueChange?.(optionToSelect)
        }
      }

      if (event.key === 'Escape') input.blur()
    },
    [isOpen, options, onValueChange],
  )

  const handleBlur = useCallback(() => setOpen(false), [])

  const handleSelectOption = useCallback(
    (selectedOption: AcceptedUser) => {
      onValueChange?.(selectedOption)
      setOpen(false)
      setTimeout(() => {
        inputRef?.current?.blur()
      }, 0)
    },
    [onValueChange],
  )

  const handleInputChange = (val: string) => {
    onInputChange?.(val)
  }

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <CommandInput
        ref={inputRef}
        value={inputValue} // Ahora está completamente controlado por el padre
        onValueChange={isLoading ? undefined : handleInputChange}
        onBlur={handleBlur}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <div className="relative mt-1">
        <div
          className={cn(
            'animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-popover outline-none shadow-md',
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
              <CommandGroup heading="Alumnos aceptados encontrados">
                {options.map((option) => {
                  const isSelected = selected?.id === option.id
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      onSelect={() => handleSelectOption(option)}
                    >
                      {isSelected ? <Check className="w-4" /> : null}
                      <div className="flex flex-col">
                        <span className="font-medium">{option.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.email}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}

            {!isLoading ? <CommandEmpty>{emptyMessage}</CommandEmpty> : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  )
}

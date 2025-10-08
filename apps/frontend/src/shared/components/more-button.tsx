import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

export type MoreMenuItem = {
  label: string
  icon?: ReactNode
  to?: string
  onClick?: () => void
  destructive?: boolean
}

type Props = {
  items: MoreMenuItem[]
  align?: 'start' | 'end'
  trigger?: ReactNode
  className?: string
}

export default function MoreMenu({
  items,
  align = 'end',
  trigger,
  className,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${className ?? ''}`}
        >
          {trigger ?? <MoreHorizontal className="w-4 h-4" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align}>
        {items.map((item, idx) =>
          item.to ? (
            <DropdownMenuItem asChild key={`${item.label}-${idx}`}>
              <Link
                to={item.to}
                className={`flex items-center gap-2 ${item.destructive ? 'text-destructive' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={`${item.label}-${idx}`}
              onSelect={(e: Event) => {
                e.preventDefault()
                item.onClick?.()
              }}
            >
              <div
                className={`flex items-center gap-2 ${item.destructive ? 'text-destructive' : ''}`}
              >
                {item.icon}
                {item.label}
              </div>
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

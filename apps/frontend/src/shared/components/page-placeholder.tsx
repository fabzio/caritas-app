import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type PagePlaceholderProps = {
  title: string
  description: string
  icon?: LucideIcon
  children?: ReactNode
}

export function PagePlaceholder({
  title,
  description,
  icon: Icon,
  children,
}: PagePlaceholderProps) {
  return (
    <section className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <Empty className="w-full max-w-2xl border border-dashed border-border/70 bg-card shadow-sm">
        <EmptyHeader>
          {Icon ? (
            <EmptyMedia variant="icon">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </EmptyMedia>
          ) : null}
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {children ? <EmptyContent>{children}</EmptyContent> : null}
      </Empty>
    </section>
  )
}

import { Separator } from '@workspace/ui/components/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@workspace/ui/components/sidebar'
import type { PropsWithChildren, ReactNode } from 'react'
import ModeToggle from '../components/mode-toggle'

type Props = PropsWithChildren & {
  sidebar: ReactNode
}

export default function MainLayout({ children, sidebar }: Props) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="mx-2">
            <ModeToggle />
          </div>
        </header>
        <main className="flex flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { useSession } from '@frontend/hooks/use-session'
import adminNavItems from '@frontend/modules/admin/layout/nav-items'
import { Separator } from '@workspace/ui/components/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@workspace/ui/components/sidebar'
import type { PropsWithChildren } from 'react'
import AppSidebar from '../components/app-sidebar'
import ModeToggle from '../components/mode-toggle'
import NavMain from '../components/nav-main'

type Props = PropsWithChildren

export default function MainLayout({ children }: Readonly<Props>) {
  const { data } = useSession()
  return (
    <SidebarProvider>
      <AppSidebar>
        <NavMain
          items={data?.user.role?.includes('admin') ? adminNavItems : []}
        />
      </AppSidebar>
      <SidebarInset>
        <article className="w-full">
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
          <main>{children}</main>
        </article>
      </SidebarInset>
    </SidebarProvider>
  )
}

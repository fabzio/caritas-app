import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import { Cross, GraduationCap, ShieldUser } from 'lucide-react'
import type { ReactNode } from 'react'
import NavUser from '@/shared/components/nav-user.tsx'
import PlatformSwitcher from '@/shared/components/platform-switcher.tsx'

type Props = {
  children: ReactNode
}

function AppSidebar({ children }: Readonly<Props>) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <PlatformSwitcher
          platforms={[
            { name: 'Administrador', logo: ShieldUser },
            {
              name: 'Salud',
              logo: Cross,
            },
            {
              name: 'Educación',
              logo: GraduationCap,
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: 'Admin',
            avatar: '',
            email: 'admin@caritas.com',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar

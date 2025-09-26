import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import { Cross, GraduationCap, ShieldUser } from 'lucide-react'
import type { ReactNode } from 'react'
import authClient from '@/lib/authClient'
import NavUser from '@/shared/components/nav-user.tsx'
import PlatformSwitcher from '@/shared/components/platform-switcher.tsx'
import { QueryKeys } from '../constants/query-keys'

type Props = {
  children: ReactNode
}

function AppSidebar({ children }: Readonly<Props>) {
  const {
    data: { data },
  } = useSuspenseQuery({
    queryKey: [QueryKeys.SESSION],
    queryFn: () => authClient.getSession(),
  })
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
        {data && (
          <NavUser
            user={{
              name: `${data.user.name} ${data.user?.surname}`,
              avatar:
                data.user.image ||
                `${data.user.name?.charAt(0)}${data.user.surname?.charAt(0)}`,
              email: data.user.email,
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import {
  Church,
  Cross,
  GraduationCap,
  Landmark,
  ShieldUser,
  UserStar,
} from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { useAccess } from '@/hooks/use-access'
import { useSession } from '@/hooks/use-session'
import NavUser from '@/shared/components/nav-user.tsx'
import PlatformSwitcher from '@/shared/components/platform-switcher.tsx'
import type { ValidRoutes } from '../types/valid-routes'
import getShortname from '../utils/get-shortname'

function AppSidebar({ children }: Readonly<PropsWithChildren>) {
  const { data } = useSession()
  const { data: access, isLoading } = useAccess()

  const accessiblePlatforms = getAccessiblePlatforms(access)
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {!isLoading && <PlatformSwitcher platforms={accessiblePlatforms} />}
      </SidebarHeader>
      <SidebarContent>{children}</SidebarContent>
      <SidebarFooter>
        {data && (
          <NavUser
            user={{
              name: `${data.user.name} ${data.user?.surname}`,
              avatar:
                data.user.image ||
                getShortname({
                  firstName: data.user.name,
                  lastName: data.user.surname,
                }),
              email: data.user.email,
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
const modules: {
  name: string
  logo: React.ElementType
  accessKey:
    | 'admin'
    | 'health'
    | 'education'
    | 'organization'
    | 'beneficiary'
    | 'user'
  path: ValidRoutes
}[] = [
  {
    name: 'Administrador',
    logo: ShieldUser,
    accessKey: 'admin',
    path: '/admin',
  },
  {
    name: 'Salud',
    logo: Cross,
    accessKey: 'health',
    path: '/health',
  },
  {
    name: 'Educación',
    logo: GraduationCap,
    accessKey: 'education',
    path: '/education',
  },
  {
    name: 'Aliado',
    logo: Landmark,
    accessKey: 'organization',
    path: '/organization',
  },
  {
    name: 'Beneficiario',
    logo: Church,
    accessKey: 'beneficiary',
    path: '/beneficiary',
  },
  {
    name: 'Beneficiario',
    logo: UserStar,
    accessKey: 'user',
    path: '/user',
  },
]

function getAccessiblePlatforms(access: ReturnType<typeof useAccess>['data']) {
  if (!access) return []

  return modules.filter((module) => {
    switch (module.accessKey) {
      case 'admin':
        return access.admin
      case 'health':
        return access.health.admin
      case 'education':
        return access.education.admin
      case 'organization':
        return access.health.organization || access.education.organization
      case 'beneficiary':
        return access.beneficiary
      case 'user':
        return access.education.user || access.health.user
      default:
        return false
    }
  })
}

export default AppSidebar

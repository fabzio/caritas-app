import type { NavItem } from '@frontend/shared/types/nav-main'
import { Building2, Settings, User } from 'lucide-react'

const userNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/user',
    icon: User,
    groupLabel: 'Usuario',
  },
  {
    title: 'Organizaciones',
    url: '/user/organizations',
    icon: Building2,
    groupLabel: 'Usuario',
  },
  {
    title: 'Configuración',
    url: '/user/settings',
    icon: Settings,
    groupLabel: 'Usuario',
  },
]

export default userNavItems

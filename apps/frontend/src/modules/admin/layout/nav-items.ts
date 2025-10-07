import type { NavItem } from '@frontend/shared/types/nav-main'
import { Layout, Users } from 'lucide-react'

const adminNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/admin',
    icon: Layout,
    groupLabel: 'Administración',
  },
  {
    title: 'Usuarios',
    url: '/admin/users',
    icon: Users,
    groupLabel: 'Administración',
  },
]

export default adminNavItems

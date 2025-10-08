import type { NavItem } from '@frontend/shared/types/nav-main'
import { Layout } from 'lucide-react'

const adminNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/admin',
    icon: Layout,
    groupLabel: 'Administración',
  },
  {
    title: 'Becas',
    url: '/education/scholarship',
    icon: Layout,
    groupLabel: 'Administración',
  },
]

export default adminNavItems

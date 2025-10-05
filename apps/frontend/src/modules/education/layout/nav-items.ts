import { Layout } from 'lucide-react'
import type { NavItem } from '@/shared/types/nav-main'

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

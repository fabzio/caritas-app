import type { NavItem } from '@frontend/shared/types/nav-main'
import { GraduationCap, Layout } from 'lucide-react'

const adminNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/education',
    icon: Layout,
    groupLabel: 'Educación',
  },
  {
    title: 'Becas',
    url: '/education/scholarship',
    icon: GraduationCap,
    groupLabel: 'Educación',
  },
]

export default adminNavItems

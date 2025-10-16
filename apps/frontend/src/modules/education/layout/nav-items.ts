import type { NavItem } from '@frontend/shared/types/nav-main'
import { Compass, GraduationCap, Layout, UserStar } from 'lucide-react'

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
  {
    title: 'Becados',
    url: '/education/recipients',
    icon: UserStar,
    groupLabel: 'Educación',
  },
  {
    title: 'Ferias vocacionales',
    url: '/education/fair',
    icon: Compass,
    groupLabel: 'Educación',
  },
]

export default adminNavItems

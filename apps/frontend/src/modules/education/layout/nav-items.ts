import type { NavItem } from '@frontend/shared/types/nav-main'
import { GraduationCap } from 'lucide-react'

const educationNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/education',
    icon: GraduationCap,
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
    icon: GraduationCap,
    groupLabel: 'Educación',
  },
]

export default educationNavItems

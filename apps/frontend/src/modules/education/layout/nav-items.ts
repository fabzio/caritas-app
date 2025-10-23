import type { NavItem } from '@frontend/shared/types/nav-main'
import {
  Building2,
  Compass,
  GraduationCap,
  Layout,
  UserStar,
} from 'lucide-react'

const educationNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/education',
    icon: Layout,
    groupLabel: 'Educación',
  },
  {
    title: 'Aliados',
    url: '/education/organization',
    icon: Building2,
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

export default educationNavItems

import type { NavItem } from '@frontend/shared/types/nav-main'
import {
  Building2,
  Compass,
  GraduationCap,
  Layout,
  UserStar,
  Users,
} from 'lucide-react'

const educationNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/education',
    icon: Layout,
    groupLabel: 'Educación',
  },
  {
    title: 'Organizaciones Aliadas',
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
  {
    title: 'Beneficiarios',
    url: '/education/beneficiaries',
    icon: Users,
    groupLabel: 'Educación',
  },
]

export default educationNavItems

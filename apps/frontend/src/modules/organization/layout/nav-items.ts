import type { NavItem } from '@frontend/shared/types/nav-main'
import { Building2, Compass, GraduationCap } from 'lucide-react'

const organizationNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/organization',
    icon: Building2,
    groupLabel: 'Organizaciones',
  },
  {
    title: 'Becas',
    url: '/organization/education/scholarship',
    icon: GraduationCap,
    groupLabel: 'Organizaciones',
  },
  {
    title: 'Ferias vocacionales',
    url: '/organization/education/fair',
    icon: Compass,
    groupLabel: 'Organizaciones',
  },
]

export default organizationNavItems

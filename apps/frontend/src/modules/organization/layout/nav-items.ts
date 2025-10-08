import type { NavItem } from '@frontend/shared/types/nav-main'
import { Building2 } from 'lucide-react'

const organizationNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/organization',
    icon: Building2,
    groupLabel: 'Organizaciones',
  },
]

export default organizationNavItems

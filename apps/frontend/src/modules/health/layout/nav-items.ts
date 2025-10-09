import type { NavItem } from '@frontend/shared/types/nav-main'
import { Hospital, Stethoscope } from 'lucide-react'

const healthNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/health',
    icon: Stethoscope,
    groupLabel: 'Salud',
  },
  {
    title: 'Aliados',
    url: '/health/allies',
    icon: Hospital,
    groupLabel: 'Salud',
  },
]

export default healthNavItems

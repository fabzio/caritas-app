import type { NavItem } from '@frontend/shared/types/nav-main'
import { Stethoscope } from 'lucide-react'

const healthNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/health',
    icon: Stethoscope,
    groupLabel: 'Salud',
  },
]

export default healthNavItems

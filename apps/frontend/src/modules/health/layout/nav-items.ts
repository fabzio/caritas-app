import type { NavItem } from '@frontend/shared/types/nav-main'
import { HeartPlus, Hospital, Stethoscope } from 'lucide-react'

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
  {
    title: 'Especialidades',
    url: '/health/speciality',
    icon: HeartPlus,
    groupLabel: 'Salud',
  },
]

export default healthNavItems

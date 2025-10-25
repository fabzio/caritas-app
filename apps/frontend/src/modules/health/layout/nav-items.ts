import type { NavItem } from '@frontend/shared/types/nav-main'
import { HeartPlus, Hospital, SquareActivity, Stethoscope } from 'lucide-react'

const healthNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/health',
    icon: Stethoscope,
    groupLabel: 'Salud',
  },
  {
    title: 'Organizaciones Aliadas',
    url: '/health/allies',
    icon: Hospital,
    groupLabel: 'Salud',
  },
  {
    title: 'Especialidades',
    url: '/health/specialities',
    icon: HeartPlus,
    groupLabel: 'Salud',
  },
  {
    title: 'Actividades',
    url: '/health/activities',
    icon: SquareActivity,
    groupLabel: 'Salud',
  },
]

export default healthNavItems

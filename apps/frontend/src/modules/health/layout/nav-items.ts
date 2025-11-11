import type { NavItem } from '@frontend/shared/types/nav-main'
import {
  HeartPlus,
  Hospital,
  LayoutDashboard,
  SquareActivity,
  Users,
} from 'lucide-react'

const healthNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/health',
    icon: LayoutDashboard,
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
  {
    title: 'Beneficiarios',
    url: '/health/beneficiaries',
    icon: Users,
    groupLabel: 'Salud',
  },
]

export default healthNavItems

import type { NavItem } from '@frontend/shared/types/nav-main'
import { GraduationCap, User } from 'lucide-react'

const userNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/user',
    icon: User,
    groupLabel: 'Usuario',
  },
  {
    title: 'Becas',
    url: '/user/education/scholarship',
    icon: GraduationCap,
    groupLabel: 'Usuario',
  },
]

export default userNavItems

import type { NavItem } from '@frontend/shared/types/nav-main'
import { User } from 'lucide-react'

const userNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/user',
    icon: User,
    groupLabel: 'Usuario',
  },
]

export default userNavItems

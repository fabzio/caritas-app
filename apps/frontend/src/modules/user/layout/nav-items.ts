import type { NavItem } from '@frontend/shared/types/nav-main'
import { Book, Cross, User } from 'lucide-react'

const userNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/user',
    icon: User,
    groupLabel: 'Usuario',
  },
  {
    title: 'Educación',
    icon: Book,
    groupLabel: 'Educación',
    items: [
      {
        title: 'Becas',
        url: '/user/education/scholarship',
      },
    ],
  },
  {
    title: 'Salud',
    icon: Cross,
    groupLabel: 'Salud',
    items: [
      {
        title: 'Actividades',
        url: '/user/health/activities',
      },
    ],
  },
]

export default userNavItems

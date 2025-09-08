import { KeyRound, Layout, LockKeyhole, User } from 'lucide-react'
import type { NavItem } from '@/shared/types/nav-main'

const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Layout,
    groupLabel: 'Administración',
  },
  {
    title: 'Usuarios',
    url: '/admin/users',
    icon: User,
    groupLabel: 'Administración',
  },
  {
    title: 'Roles',
    url: '/admin/roles',
    icon: LockKeyhole,
    groupLabel: 'Administración',
  },
  {
    title: 'Permisos',
    url: '/admin/permissions',
    icon: KeyRound,
    groupLabel: 'Administración',
  },
]

export default adminNavItems

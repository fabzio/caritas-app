import type { NavItem } from '@frontend/shared/types/nav-main'
import { HeartPulse } from 'lucide-react'

const beneficiaryNavItems: NavItem[] = [
  {
    title: 'General',
    url: '/beneficiary',
    icon: HeartPulse,
    groupLabel: 'Beneficiarios',
  },
]

export default beneficiaryNavItems

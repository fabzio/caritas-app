import type { ValidRoutes } from './valid-routes'

export type NavItem = {
  title: string
  url?: ValidRoutes
  icon?: React.ElementType
  groupLabel?: string
  items?: {
    title: string
    url: ValidRoutes
  }[]
}

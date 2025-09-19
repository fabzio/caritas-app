import type { FileRoutesByTo } from '@/routeTree.gen'

type ValidRoutes = keyof FileRoutesByTo
export type NavItem = {
  title: string
  url: ValidRoutes
  icon?: React.ElementType
  groupLabel?: string
  items?: {
    title: string
    url: ValidRoutes
  }[]
}

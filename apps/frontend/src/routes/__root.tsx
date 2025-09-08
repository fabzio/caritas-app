import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Toaster } from '@workspace/ui/components/sonner'
import type authClient from '@/lib/authClient.ts'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

export interface MyRouterContext {
  queryClient: QueryClient
  authClient: typeof authClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Cáritas Lima - Sistema de Gestión',
      },
      {
        title: 'Cáritas Lima 360',
      },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <Toaster />
      <TanStackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import authClient from '@/lib/authClient.ts'

export function getContext() {
  const queryClient = new QueryClient()
  return {
    queryClient,
    authClient,
  }
}

export function Provider({
  children,
  queryClient,
}: Readonly<{
  children: React.ReactNode
  queryClient: QueryClient
}>) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

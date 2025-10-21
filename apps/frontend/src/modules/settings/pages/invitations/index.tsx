import { Separator } from '@workspace/ui/components/separator'
import { Spinner } from '@workspace/ui/components/spinner'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { Suspense } from 'react'
import InvitationList from './components/invitation-list'

export default function Invitations() {
  return (
    <>
      <h1 className="text-2xl font-medium">Tus Invitaciones</h1>
      <Separator />
      <div className="mt-4 space-y-3 max-w-3xl">
        <Tabs defaultValue="pending">
          <TabsList>
            {states.map((state) => (
              <TabsTrigger key={state.value} value={state.value}>
                {state.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {states.map((state) => (
            <TabsContent key={state.value} value={state.value}>
              <Suspense
                fallback={
                  <div className="w-full py-4 flex justify-center">
                    <Spinner />
                  </div>
                }
              >
                <InvitationList status={state.value} />
              </Suspense>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}

export const states: {
  label: string
  value: 'pending' | 'accepted' | 'canceled' | 'rejected'
}[] = [
  {
    label: 'Pendientes',
    value: 'pending',
  },
  {
    label: 'Aceptadas',
    value: 'accepted',
  },
  {
    label: 'Rechazadas',
    value: 'rejected',
  },
  {
    label: 'Canceladas',
    value: 'canceled',
  },
]

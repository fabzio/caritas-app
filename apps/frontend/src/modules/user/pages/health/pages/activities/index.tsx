import { useFilters } from '@frontend/hooks/use-filters'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQueryClient } from '@tanstack/react-query'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import ActiveActivities from './components/active-activities'
import HistoryActivities from './components/history-activities'

export default function UserActivities() {
  const queryClient = useQueryClient()
  const { setFilters, filters } = useFilters(
    '/_authenticated/user/health/activities/',
  )
  const handleTabChange = (value: string) => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.HEALTH.ACTIVITY, filters],
    })
    if (value === 'active') setFilters({ view: 'active' })
    else if (value === 'history') setFilters({ view: 'participated' })
  }
  return (
    <div className="mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Actividades</h2>
      <div>
        <Tabs
          defaultValue={
            filters.view
              ? filters.view === 'active'
                ? 'active'
                : 'history'
              : 'active'
          }
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="history">Finalizadas</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <ActiveActivities />
          </TabsContent>
          <TabsContent value="history">
            <HistoryActivities />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

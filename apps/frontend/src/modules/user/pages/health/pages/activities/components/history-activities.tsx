import { Spinner } from '@workspace/ui/components/spinner'
import { useUserActivities } from '../hooks/use-user-activities'
import ActivityCard from './activity-card'
import EmptyActivities from './empty-activities'
import HistorySelector from './history-selector'

export default function HistoryActivities() {
  const { data: activities, isFetched, isLoading } = useUserActivities()

  if (isLoading) return <Spinner />
  return (
    <div className="space-y-4">
      <HistorySelector />
      {isFetched && activities?.data.length === 0 ? (
        <EmptyActivities mode="history" />
      ) : (
        activities?.data.map((activity) => (
          <ActivityCard key={activity.id} {...activity} />
        ))
      )}
    </div>
  )
}

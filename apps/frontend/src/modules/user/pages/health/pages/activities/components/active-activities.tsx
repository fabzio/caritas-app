import { Separator } from '@workspace/ui/components/separator'
import { Spinner } from '@workspace/ui/components/spinner'
import { useState } from 'react'
import { useUserActivities } from '../hooks/use-user-activities'
import ActivityCard from './activity-card'
import EmptyActivities from './empty-activities'
import RegisterDialog from './register-dialog'

export default function ActiveActivities() {
  const [open, setOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<{
    id: number
    name: string
    date: Date
  } | null>(null)
  const { data: activities, isFetched, isLoading } = useUserActivities()
  if (isLoading) return <Spinner />
  if (activities && isFetched && activities?.data.length === 0)
    return <EmptyActivities mode="active" />
  const participating = activities?.data.filter(
    (activity) => activity.registered,
  )
  const rest = activities?.data.filter((activity) => !activity.registered)
  const handleRegister = (activityId: number) => {
    setSelectedActivity(
      activities?.data.find((a) => a.id === activityId) ?? null,
    )
    setOpen(true)
  }
  return (
    <div className="space-y-4">
      {(participating?.length ?? 0) > 0 && (
        <>
          <div>
            <h3 className="font-semibold">Participando</h3>
            <div>
              {participating?.map((activity) => (
                <ActivityCard key={activity.id} {...activity} />
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}
      <div>
        <h3 className="font-semibold mb-2">Disponibles</h3>
        <div>
          {rest?.map((activity) => (
            <button
              className="w-full"
              type="button"
              key={activity.id}
              onClick={() => handleRegister(activity.id)}
            >
              <ActivityCard {...activity} />
            </button>
          ))}
        </div>
      </div>
      <RegisterDialog
        activityId={selectedActivity?.id}
        activityName={selectedActivity?.name}
        activityDate={selectedActivity?.date}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}

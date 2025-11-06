import { useSession } from '@frontend/hooks/use-session'
import ActivityAttentionsBoard from '@frontend/modules/health/components/activity-attentions-board'
import { useLoaderData, useParams } from '@tanstack/react-router'

export default function UserActivityDetail() {
  const { id } = useParams<{ id: string }>({
    from: '/_authenticated/user/health/activities/$id',
  })
  const { data: session } = useSession()
  const userId = session?.user?.id ?? ''
  const loaderData = useLoaderData<{
    activity?: { name?: string; date?: string | null }
  }>({ from: '/_authenticated/user/health/activities/$id' })

  return (
    <ActivityAttentionsBoard
      activityId={id}
      userId={userId}
      mode="user"
      activityName={loaderData?.activity?.name}
      activityDate={loaderData?.activity?.date ?? null}
    />
  )
}

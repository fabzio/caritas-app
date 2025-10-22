import { Link, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

export default function ActivityDetailPage() {
  const { activityId } = useParams({
    from: '/_authenticated/health/activities/$activityId/',
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="w-full">
        <article className="flex flex-col">
          <header className="mb-6">
            <h1 className="text-2xl font-bold leading-tight">Actividad</h1>
            <p className="text-muted-foreground">
              {'TODO: Implementar detalle de actividad'}
            </p>
          </header>
          {/* TODO: Implementar detalle de actividad */}
          <div className="flex gap-4">
            <Button asChild>
              <Link
                to="/health/activities/$activityId/assistance"
                params={{ activityId }}
              >
                Ver asistencia
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}

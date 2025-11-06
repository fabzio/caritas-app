import { useSession } from '@frontend/hooks/use-session'
import RegisteredTasks from './components/registered-task'
import UtilsBanner from './components/utils-banner'

export default function General() {
  const { data: session } = useSession()
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-pretty mb-4">
        Le damos la bienvenida de nuevo, {session?.user?.name}.
      </h1>
      <div>
        <UtilsBanner />
        <RegisteredTasks />
      </div>
    </div>
  )
}

import { getRouteApi, Link, useSearch } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import AssistantCard from './components/assistant-card'
import SearchAssistantInput from './components/search-assistant-input'
import type { ActivityParticipant } from './hooks/use-activity-participants'
import { useActivityParticipants } from './hooks/use-activity-participants'

const routeApi = getRouteApi('/_authenticated/health/activities/assistance')

export default function AssistancePage() {
  const { id } = useSearch({
    from: '/_authenticated/health/activities/assistance',
  })
  const loaderData = routeApi.useLoaderData()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: participants, isLoading } = useActivityParticipants({
    activityId: id,
    searchQuery,
  })

  const handleAssistantClick = (participant: ActivityParticipant) => {
    // TODO: Implement onClick functionality later
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const formattedDate = loaderData?.date
    ? format(new Date(loaderData.date), 'PPP', { locale: es })
    : ''

  const getEmptyMessage = () => {
    if (searchQuery) {
      return 'No se encontraron asistentes con ese criterio de búsqueda'
    }
    return 'No hay asistentes registrados'
  }

  const renderAssistantList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <Spinner />
        </div>
      )
    }

    if (participants && participants.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((participant) => {
            const fullName = participant.surname
              ? `${participant.name} ${participant.surname}`
              : participant.name
            return (
              <AssistantCard
                key={participant.id}
                assistant={{
                  id: participant.id,
                  name: fullName,
                  documentType: participant.documentType || 'N/A',
                  documentNumber: participant.documentNumber || 'N/A',
                }}
                onClick={() => handleAssistantClick(participant)}
              />
            )
          })}
        </div>
      )
    }

    return (
      <div className="text-center py-12 text-muted-foreground">
        {getEmptyMessage()}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="w-full">
        <article className="flex flex-col">
          <header className="mb-6">
            <h1 className="text-2xl font-bold leading-tight">Asistentes</h1>
            <p className="text-muted-foreground">
              {loaderData?.name} - {formattedDate}
            </p>
          </header>

          <div className="flex justify-between items-start sm:items-center gap-4 mb-6">
            <Link to="/health/activities">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Regresar
              </Button>
            </Link>

            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar asistente
            </Button>
          </div>

          <div className="mb-6">
            <SearchAssistantInput onSearch={handleSearch} />
          </div>

          <div className="space-y-4">{renderAssistantList()}</div>
        </article>
      </div>
    </div>
  )
}

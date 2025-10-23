import { getRouteApi, Link, useParams } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Spinner } from '@workspace/ui/components/spinner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Award, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import AttentionCard from './components/attention-card'
import AttentionDetailsDialog from './components/attention-details-dialog'
import CreateAttentionDialog from './components/create-attention-dialog'
import SearchAttentionInput from './components/search-attention-input'
import { useActivityParticipant } from './hooks/use-activity-participant'
import { useUpdateActivityUser } from './hooks/use-update-activity-user'
import {
  type UserAttention,
  useUserAttentions,
} from './hooks/use-user-attentions'

const routeApi = getRouteApi(
  '/_authenticated/health/activities/$activityId/attentions/$userId',
)

export default function AttentionsPage() {
  const { activityId, userId } = useParams({
    from: '/_authenticated/health/activities/$activityId/attentions/$userId',
  })
  const loaderData = routeApi.useLoaderData()
  const [searchQuery, setSearchQuery] = useState('')
  const { mutate: updateActivityUser, isPending: isPendingUpdate } =
    useUpdateActivityUser()
  const [isMarkIncentiveModalOpen, setIsMarkIncentiveModalOpen] =
    useState(false)
  const [isAttentionDetailsModalOpen, setIsAttentionDetailsModalOpen] =
    useState(false)
  const [isCreateAttentionModalOpen, setIsCreateAttentionModalOpen] =
    useState(false)
  const [selectedAttention, setSelectedAttention] =
    useState<UserAttention | null>(null)

  const { data: participant } = useActivityParticipant({ activityId, userId })
  const { data: attentions, isLoading } = useUserAttentions({
    activityId,
    userId,
    searchQuery,
  })

  const handleAttentionClick = (attention: UserAttention) => {
    if (attention.hasAttention) {
      setSelectedAttention(attention)
      setIsAttentionDetailsModalOpen(true)
    } else {
      setSelectedAttention(attention)
      setIsCreateAttentionModalOpen(true)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleMarkIncentive = () => {
    updateActivityUser({
      userId,
      activityId: Number(activityId),
      rewarded: true,
    })
    setIsMarkIncentiveModalOpen(false)
  }

  const getParticipantName = () => {
    const participantData = participant || loaderData?.participant
    if (!participantData) return 'Participante'
    const { name, surname } = participantData
    return surname ? `${name} ${surname}` : name
  }

  const participantName = getParticipantName()
  const hasReceivedIncentive =
    participant?.rewarded || loaderData?.participant?.rewarded || false

  const formattedDate = loaderData?.activity?.date
    ? format(new Date(loaderData.activity.date), 'PPP', { locale: es })
    : ''

  const getEmptyMessage = () => {
    if (searchQuery) {
      return 'No se encontraron atenciones con ese criterio de búsqueda'
    }
    return 'No hay atenciones disponibles'
  }

  const renderAttentionsList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <Spinner />
        </div>
      )
    }

    if (attentions && attentions.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attentions.map((attention) => (
            <AttentionCard
              key={attention.specialityId}
              attention={attention}
              onClick={handleAttentionClick}
            />
          ))}
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
            <h1 className="text-2xl font-bold leading-tight">
              {participantName}
            </h1>
            <p className="text-muted-foreground">
              {loaderData?.activity?.name} - {formattedDate}
            </p>
          </header>

          <div className="flex sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link
              to="/health/activities/$activityId/assistance"
              params={{ activityId }}
            >
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Regresar
              </Button>
            </Link>

            <Button
              onClick={() => setIsMarkIncentiveModalOpen(true)}
              disabled={hasReceivedIncentive}
              variant={hasReceivedIncentive ? 'secondary' : 'default'}
            >
              {hasReceivedIncentive ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Incentivo recibido
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Marcar incentivo entregado
                </>
              )}
            </Button>
          </div>

          <div className="mb-6">
            <SearchAttentionInput onSearch={handleSearch} />
          </div>

          <div className="space-y-4">{renderAttentionsList()}</div>
        </article>
      </div>
      <Dialog
        open={isMarkIncentiveModalOpen}
        onOpenChange={setIsMarkIncentiveModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {`¿Seguro que desea marcar el registro de incentivo?`}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="button"
              onClick={handleMarkIncentive}
              disabled={isPendingUpdate}
            >
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateAttentionDialog
        open={isCreateAttentionModalOpen}
        onOpenChange={() => setIsCreateAttentionModalOpen((open) => !open)}
        attention={selectedAttention}
        userId={userId}
        participantName={participantName}
      />

      <AttentionDetailsDialog
        open={isAttentionDetailsModalOpen}
        onOpenChange={() => setIsAttentionDetailsModalOpen((open) => !open)}
        specialityName={selectedAttention?.specialityName || ''}
        attentionTime={selectedAttention?.attentionTime || null}
        observations={selectedAttention?.observations || null}
      />
    </div>
  )
}

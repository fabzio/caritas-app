import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Award, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import AttentionCard from '../pages/activities/pages/attentions/components/attention-card'
import AttentionDetailsDialog from '../pages/activities/pages/attentions/components/attention-details-dialog'
import ConfirmIncentiveDialog from '../pages/activities/pages/attentions/components/confirm-incentive-dialog'
import CreateAttentionDialog from '../pages/activities/pages/attentions/components/create-attention-dialog'
import SearchAttentionInput from '../pages/activities/pages/attentions/components/search-attention-input'
import { useActivityParticipant } from '../pages/activities/pages/attentions/hooks/use-activity-participant'
import {
  type UserAttention,
  useUserAttentions,
} from '../pages/activities/pages/attentions/hooks/use-user-attentions'

interface ActivityAttentionsBoardProps {
  activityId: string
  userId: string
  mode: 'staff' | 'user'
  activityName?: string
  activityDate?: string | null
}

export default function ActivityAttentionsBoard({
  activityId,
  userId,
  mode,
  activityName,
  activityDate,
}: Readonly<ActivityAttentionsBoardProps>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMarkIncentiveModalOpen, setIsMarkIncentiveModalOpen] =
    useState(false)
  const [isAttentionDetailsModalOpen, setIsAttentionDetailsModalOpen] =
    useState(false)
  const [isCreateAttentionModalOpen, setIsCreateAttentionModalOpen] =
    useState(false)
  const [selectedAttention, setSelectedAttention] =
    useState<UserAttention | null>(null)

  const { data: participant } = useActivityParticipant({
    activityId,
    userId,
  })
  const { data: attentions, isLoading } = useUserAttentions({
    activityId,
    userId,
    searchQuery,
  })

  const handleAttentionClick = (attention: UserAttention) => {
    if (mode === 'user') {
      if (attention.hasAttention) {
        setSelectedAttention(attention)
        setIsAttentionDetailsModalOpen(true)
      }
      return
    }
    if (attention.hasAttention) {
      setSelectedAttention(attention)
      setIsAttentionDetailsModalOpen(true)
    } else {
      setSelectedAttention(attention)
      setIsCreateAttentionModalOpen(true)
    }
  }

  const participantName = participant
    ? [participant.name, participant.surname].filter(Boolean).join(' ')
    : 'Participante'

  const hasReceivedIncentive = participant?.rewarded ?? false

  const formattedDate = activityDate
    ? format(new Date(activityDate), 'PPP', { locale: es })
    : ''

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
              interactive={
                mode === 'staff' || (mode === 'user' && attention.hasAttention)
              }
            />
          ))}
        </div>
      )
    }
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay atenciones disponibles
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
              {activityName} {formattedDate && `- ${formattedDate}`}
            </p>
          </header>
          <div className="flex sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {mode === 'staff' ? (
              <Link
                to="/health/activities/$activityId/assistance"
                params={{ activityId }}
              >
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Regresar
                </Button>
              </Link>
            ) : (
              <Link to="/user/health/activities">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Regresar
                </Button>
              </Link>
            )}
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
            <SearchAttentionInput onSearch={setSearchQuery} />
          </div>
          <div className="space-y-4">{renderAttentionsList()}</div>
        </article>
      </div>
      <ConfirmIncentiveDialog
        open={isMarkIncentiveModalOpen}
        onOpenChange={setIsMarkIncentiveModalOpen}
        userId={userId}
        activityId={activityId}
      />
      {mode === 'staff' && (
        <CreateAttentionDialog
          open={isCreateAttentionModalOpen}
          onOpenChange={() => setIsCreateAttentionModalOpen((o) => !o)}
          attention={selectedAttention}
          userId={userId}
          participantName={participantName}
        />
      )}
      <AttentionDetailsDialog
        open={isAttentionDetailsModalOpen}
        onOpenChange={() => setIsAttentionDetailsModalOpen((o) => !o)}
        specialityName={selectedAttention?.specialityName || ''}
        attentionTime={selectedAttention?.attentionTime || null}
        observations={selectedAttention?.observations || null}
      />
    </div>
  )
}

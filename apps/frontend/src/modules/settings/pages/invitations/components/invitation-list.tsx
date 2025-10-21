import { Link, useSearch } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import { Building2, Clock, MailX } from 'lucide-react'
import { Activity } from 'react'
import { states } from '..'
import { useReceivedInvitations } from '../hooks/use-received-invitations'
import AcceptInvitation from './accept-invitation'
import RejectInvitation from './reject-invitation'

type Props = {
  status: 'pending' | 'accepted' | 'canceled' | 'rejected'
}
export default function InvitationList({ status }: Readonly<Props>) {
  const { redirect } = useSearch({ from: '/_authenticated/settings' })
  const { data } = useReceivedInvitations()
  const invitations = data.filter((invitation) => invitation.status === status)
  return (
    <>
      <ul>
        {invitations.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <MailX />
              </EmptyMedia>
              <EmptyTitle>
                No hay invitaciones{' '}
                {states.find((s) => s.value === status)?.label.toLowerCase()}.
              </EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              Parece que no tienes invitaciones en este estado.
            </EmptyContent>
          </Empty>
        ) : (
          invitations.map((invitation) => {
            const organizationName =
              invitation.organization?.name ?? invitation.email
            const organizationTypeLabel = invitation.organization?.type
              ? organizationTypeLabels[invitation.organization.type]
              : 'Invitación sin organización'
            const inviterName =
              invitation.inviter?.fullName ??
              invitation.inviter?.email ??
              'Usuario desconocido'
            const statusKey = ensureStatusKey(invitation.status)
            return (
              <li key={invitation.id} className="mb-4 last:mb-0">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
                        {invitation.organization?.logo ? (
                          <img
                            src={invitation.organization.logo}
                            alt={organizationName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <CardTitle>{organizationName}</CardTitle>
                        <CardDescription>
                          {organizationTypeLabel}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={statusVariants[statusKey]}>
                      {statusLabels[statusKey]}
                    </Badge>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="grid gap-1">
                      <span className="text-sm font-medium">
                        {invitation.email}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Invitado por {inviterName}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {roleLabels[invitation.role]}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Expira el {formatExpiration(invitation.expiresAt)}
                      </span>
                    </div>
                    <Activity
                      mode={status === 'pending' ? 'visible' : 'hidden'}
                    >
                      <CardAction className="flex gap-2">
                        <RejectInvitation
                          invitationId={invitation.id}
                          organizationName={invitation.organization?.name}
                        />
                        <Button asChild>
                          <Link
                            to="/settings/invitations"
                            search={{
                              id: invitation.id,
                              redirect: redirect,
                            }}
                          >
                            Aceptar
                          </Link>
                        </Button>
                      </CardAction>
                    </Activity>
                  </CardFooter>
                </Card>
              </li>
            )
          })
        )}
      </ul>
      <AcceptInvitation />
    </>
  )
}

type InvitationRole =
  | 'admin'
  | 'member'
  | 'owner'
  | 'healthMember'
  | 'educationMember'
type InvitationStatusType = 'pending' | 'accepted' | 'canceled' | 'rejected'
type OrganizationType = 'caritas' | 'education' | 'health' | 'beneficiary'

const roleLabels: Record<InvitationRole, string> = {
  admin: 'Administrador',
  member: 'Miembro',
  owner: 'Propietario',
  healthMember: 'Miembro de salud',
  educationMember: 'Miembro de educación',
}
const organizationTypeLabels: Record<OrganizationType, string> = {
  caritas: 'Cáritas Lima',
  education: 'Centro de Educación',
  health: 'Centro de Salud',
  beneficiary: 'Beneficiario',
}
const statusLabels: Record<InvitationStatusType, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  canceled: 'Cancelada',
  rejected: 'Rechazada',
}
const statusVariants: Record<
  InvitationStatusType,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'secondary',
  accepted: 'default',
  canceled: 'outline',
  rejected: 'outline',
}
const statusKeys: Set<InvitationStatusType> = new Set([
  'pending',
  'accepted',
  'canceled',
  'rejected',
])
const ensureStatusKey = (status: string): InvitationStatusType =>
  statusKeys.has(status as InvitationStatusType)
    ? (status as InvitationStatusType)
    : 'pending'
const formatExpiration = (date: Date | string) =>
  new Date(date).toLocaleString('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

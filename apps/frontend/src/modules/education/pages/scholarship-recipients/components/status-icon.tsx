import { CircleCheck, CircleX, Clock } from 'lucide-react'

export default function StatusIcon({ status }: Readonly<{ status: string }>) {
  let statusName = 'Rechazado'
  if (status === 'approved') statusName = 'Aprobado'
  else if (status === 'pending') statusName = 'Pendiente'
  return (
    <div className="flex items-center gap-2">
      {status === 'approved' && <CircleCheck />}
      {status === 'pending' && <Clock />}
      {status === 'rejected' && <CircleX />}
      {statusName}
    </div>
  )
}

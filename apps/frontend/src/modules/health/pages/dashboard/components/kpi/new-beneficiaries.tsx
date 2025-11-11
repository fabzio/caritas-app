import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useGetBeneficiaries } from '../../hooks/use-get-beneficiaries'

export default function NewBeneficiaries() {
  const { data, isLoading } = useGetBeneficiaries()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardDescription>Total de Atenciones</CardDescription>
          <CardTitle>
            {isLoading ? <Skeleton className="h-8 w-32" /> : data?.attentions}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total de Inscripciones</CardDescription>
          <CardTitle>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              data?.registrations
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Incentivos Entregados</CardDescription>
          <CardTitle>
            {isLoading ? <Skeleton className="h-8 w-32" /> : data?.rewarded}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Nuevos Participantes</CardDescription>
          <CardTitle>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              data?.newParticipants
            )}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

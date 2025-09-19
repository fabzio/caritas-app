import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import MembersTable from './components/members-table'
import TeamsTable from './components/teams-table'
import { useOrganization } from './hooks/use-organization'

export default function Dashboard() {
  const { data } = useOrganization()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">{data.name}</h1>
      </div>
      <div className="w-full flex gap-8">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Miembros</CardTitle>
            <CardDescription>
              Lista de usuarios con su rol y fecha de incorporación
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <MembersTable members={data.members} />
          </CardContent>
        </Card>

        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Equipos</CardTitle>
            <CardDescription>
              Organizaciones internas disponibles para asignaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <TeamsTable teams={data.teams} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

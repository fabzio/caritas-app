import { useSession } from '@frontend/hooks/use-session'
import { DEFAULT_TEAMS } from '@frontend/shared/constants/default-teams'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { User, Users2 } from 'lucide-react'
import { useOrganization } from './hooks/use-organization'

export default function Dashboard() {
  const { data } = useOrganization()
  const { data: session } = useSession()
  const owner = data.members.find((member) =>
    member.role.split(',').includes('owner'),
  )?.user
  const current = data.members.find(
    (member) => member.userId === session?.user.id,
  )
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">{data.name}</h1>
      </div>
      <div className="w-full flex flex-wrap gap-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Organización</CardTitle>
            <CardDescription>Información general</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="p-1">
              <CardContent className="p-1 flex justify-between items-center gap-2">
                <div className="flex flex-col">
                  <span>{owner?.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {owner?.email}
                  </span>
                </div>
                <Badge>Propietario</Badge>
              </CardContent>
            </Card>
            <Separator />
            <div className="flex justify-around">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground gap-2">
                  <User size={16} />
                  Miembros
                </div>
                <span>{data.members.length}</span>
              </div>
              <div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-muted-foreground gap-2">
                    <Users2 size={16} />
                    Equipos
                  </div>
                  <span>{data.teams.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Acceso</CardTitle>
            <CardDescription>Información de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="p-1">
              <CardContent className="p-1 flex items-center gap-2">
                <div className="flex flex-col">
                  <span>{current?.user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {current?.user.email}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Separator />
            <div className="flex justify-around">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-muted-foreground gap-2">
                  <User size={16} />
                  Roles
                </div>
                <div>
                  {current?.role.split(',').map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {data.teams?.map((team) => {
                let role = 'all'
                if (team.name === DEFAULT_TEAMS.HEALTH) role = 'healthMember'
                if (team.name === DEFAULT_TEAMS.EDUCATION)
                  role = 'educationMember'
                if (team.name === DEFAULT_TEAMS.ADMIN) role = 'admin'
                return (
                  <li
                    key={team.id}
                    className="px-2 py-1 border rounded flex justify-between items-center hover:bg-accent"
                  >
                    <Link
                      className="w-full flex justify-between items-center"
                      to="/admin/users"
                      search={{
                        role,
                      }}
                    >
                      <span>{team.name}</span>

                      {current?.role.split(',').includes(role) && (
                        <Badge variant="outline">En el equipo</Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

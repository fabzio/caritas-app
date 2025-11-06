import { useAccess } from '@frontend/hooks/use-access'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@workspace/ui/components/card'
import { GraduationCap, HeartPlus, Settings } from 'lucide-react'

export default function UtilsBanner() {
  const { data } = useAccess()
  return (
    <Card>
      <CardContent className="flex gap-4 justify-around items-center">
        <Link to="/user/education/scholarship">
          <div className="flex flex-col gap-1 items-center">
            <Card className="w-fit py-2">
              <CardContent className="px-2">
                <GraduationCap size={36} />
              </CardContent>
            </Card>
            <p className=" text-xs">Becas</p>
          </div>
        </Link>
        <Link to="/user/health/activities">
          <div className="flex flex-col gap-1 items-center">
            <Card className="w-fit py-2">
              <CardContent className="px-2">
                <HeartPlus size={36} />
              </CardContent>
            </Card>
            <p className=" text-xs">Actividades</p>
          </div>
        </Link>
        <Link
          to="/settings"
          search={{
            redirect: '/user',
          }}
        >
          <div className="flex flex-col gap-1 items-center">
            <Card className="w-fit py-2">
              <CardContent className="px-2">
                <Settings size={36} />
              </CardContent>
            </Card>
            <p className=" text-xs">Configuración</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

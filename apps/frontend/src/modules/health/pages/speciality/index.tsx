import { useIsMobile } from '@frontend/hooks/use-mobile'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { PlusCircle } from 'lucide-react'

export default function SpecialityPage() {
  const isMobile = useIsMobile()
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Administración de especialidades
        </h1>
      </div>
      <div>
        <div className="w-full flex justify-end ">
          <Link to="/health/speciality/create">
            <Button className="w-full max-w-xs" size={isMobile ? 'sm' : 'lg'}>
              <PlusCircle />
              Registrar nueva especialidad
            </Button>
          </Link>
        </div>
        Aquí puedes agregar la tabla o lista de especialidades en formato
        desktop y mobile(priori)
      </div>
    </div>
  )
}

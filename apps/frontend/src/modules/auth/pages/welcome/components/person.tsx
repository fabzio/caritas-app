import { Label } from '@workspace/ui/components/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@workspace/ui/components/radio-group'
import { School, UserStar } from 'lucide-react'
import { env } from '@/env'

export default function Person() {
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup>
        {personType.map((type) => (
          <Label
            key={type.name}
            className="hover:bg-accent/50 flex gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary items-center"
          >
            <RadioGroupItem value={type.name} id={type.name} defaultChecked />
            <div>
              <type.icon size={24} />
            </div>
            <div className="grid gap-1.5 font-normal">
              <p className="text-sm leading-none font-medium">{type.name}</p>
              <p className="text-muted-foreground text-sm">
                {type.description}
              </p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

const personType = [
  {
    name: 'Estudiante',
    description:
      'Estudiante de una parroquia/beneficiario en busqueda de apoyo educativo',
    icon: School,
  },
  {
    name: 'Adulto',
    description: `Accede a campañas de salud ofrecidas por ${env.VITE_ORG_NAME}`,
    icon: UserStar,
  },
]

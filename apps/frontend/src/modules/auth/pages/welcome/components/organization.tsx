import { Label } from '@workspace/ui/components/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@workspace/ui/components/radio-group'
import { Church, Cross, GraduationCap } from 'lucide-react'

export default function Organization() {
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup>
        {organizationType.map((type) => (
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

const organizationType = [
  {
    name: 'Aliado de Salud',
    description:
      'Organizaciones que apoyan en campañas de salud y educación sanitaria',
    icon: Cross,
  },
  {
    name: 'Aliado de Educación',
    description:
      'Instituciones dedicadas a programas educativos y desarrollo académico',
    icon: GraduationCap,
  },
  {
    name: 'Parroquia/Beneficiario',
    description:
      'Comunidades parroquiales y beneficiarios directos de los programas',
    icon: Church,
  },
]

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form'
import { Label } from '@workspace/ui/components/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@workspace/ui/components/radio-group'
import { Church, Cross, GraduationCap } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

export default function OrganizationTypeForm() {
  const form = useFormContext<{ type: string }>()
  return (
    <Form {...form}>
      <div className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {organizationType.map((orgType) => (
                    <FormItem key={orgType.name}>
                      <FormControl>
                        <Label className="hover:bg-accent/50 flex gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary items-center">
                          <RadioGroupItem
                            value={orgType.type}
                            id={orgType.name}
                            defaultChecked
                          />
                          <div>
                            <orgType.icon size={24} />
                          </div>
                          <div className="grid gap-1.5 font-normal">
                            <p className="text-sm leading-none font-medium">
                              {orgType.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {orgType.description}
                            </p>
                          </div>
                        </Label>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

const organizationType = [
  {
    name: 'Aliado de Salud',
    type: 'health',
    description:
      'Organizaciones que apoyan en campañas de salud y educación sanitaria',
    icon: Cross,
  },
  {
    name: 'Aliado de Educación',
    type: 'education',
    description:
      'Instituciones dedicadas a programas educativos y desarrollo académico',
    icon: GraduationCap,
  },
  {
    name: 'Parroquia/Beneficiario',
    type: 'beneficiary',
    description:
      'Comunidades parroquiales y beneficiarios directos de los programas',
    icon: Church,
  },
]

import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form'
import { Label } from '@workspace/ui/components/label'
import { HeartHandshake, School } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { env } from '@/env'
import type { PersonForm } from '../../models/person'

export default function PersonProfileForm() {
  const form = useFormContext<PersonForm>()
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="profiles"
        render={() => (
          <FormItem>
            <FormControl>
              <div className="flex flex-col gap-2">
                {personType.map((type) => (
                  <FormField
                    key={type.name}
                    control={form.control}
                    name="profiles"
                    render={({ field }) => (
                      <FormItem key={type.name}>
                        <FormControl>
                          <Label
                            key={type.name}
                            className="hover:bg-accent/50 flex gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary items-center"
                          >
                            <Checkbox
                              value={type.name}
                              id={type.name}
                              checked={field.value?.includes(
                                type.profile as 'student' | 'patient',
                              )}
                              onCheckedChange={(checked) =>
                                checked
                                  ? field.onChange([
                                      ...field.value,
                                      type.profile as 'student' | 'patient',
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== type.profile,
                                      ),
                                    )
                              }
                            />
                            <div>
                              <type.icon size={24} />
                            </div>
                            <div className="grid gap-1.5 font-normal">
                              <p className="text-sm leading-none font-medium">
                                {type.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {type.description}
                              </p>
                            </div>
                          </Label>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}

const personType = [
  {
    name: 'Estudiante',
    profile: 'student',
    description:
      'Estudiante de una parroquia/beneficiario en busqueda de apoyo educativo',
    icon: School,
  },
  {
    name: 'Paciente',
    profile: 'patient',
    description: `Accede a campañas de salud ofrecidas por ${env.VITE_ORG_NAME}`,
    icon: HeartHandshake,
  },
]

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useFormContext } from 'react-hook-form'
import type { PatientForm, PersonForm, StudentForm } from '../../models/person'

export default function ProfileDetailsForm() {
  const form = useFormContext<PersonForm & StudentForm & PatientForm>()

  const studentProfile = form.getValues('profiles')?.includes('student')
  const patientProfile = form.getValues('profiles')?.includes('patient')
  return (
    <div className="space-y-6">
      {studentProfile && (
        <>
          <FormField
            control={form.control}
            name="schoolId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institución educativa</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una institución" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="school-1">Colegio San Juan</SelectItem>
                    <SelectItem value="school-2">
                      IE María Auxiliadora
                    </SelectItem>
                    <SelectItem value="school-3">Colegio Santa Rosa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado escolar</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un grado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade} value={grade.toLowerCase()}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="guardianEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo del apoderado</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Ingrese el correo del apoderado"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      {patientProfile && (
        <FormField
          control={form.control}
          name="insuranceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de seguro</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo de seguro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {insuranceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
const gradeOptions = ['4to Secundaria', '5to Secundaria']

const insuranceOptions = [
  { label: 'SIS', value: 'SIS' },
  { label: 'Particular', value: 'private' },
]

import { useSession } from '@frontend/hooks/use-session'
import type { PatientForm } from '@frontend/shared/models/person'
import { patientFormSchema } from '@frontend/shared/models/person'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Spinner } from '@workspace/ui/components/spinner'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useGetPatient } from '../hooks/use-get-patient'
import { useSetPatient } from '../hooks/use-set-patient'
import { useUpdatePatient } from '../hooks/use-update-patient'

const insuranceOptions: {
  label: string
  value: PatientForm['insuranceType']
}[] = [
  { label: 'Sin seguro', value: 'none' },
  { label: 'SIS', value: 'public' },
  { label: 'Particular', value: 'private' },
]

export default function HealthDetails() {
  const {
    data: patient,
    isLoading: isLoadingPatient,
    isError,
  } = useGetPatient()
  const form = useForm<PatientForm>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      insuranceType: 'none',
    },
  })
  const { data: session } = useSession()

  const { mutate, isPending } = useUpdatePatient()
  const { mutate: setPatientMutate, isPending: isSettingPatient } =
    useSetPatient()

  useEffect(() => {
    if (!patient) return
    form.reset({
      insuranceType: patient.insuranceType ?? 'none',
    })
  }, [patient, form])

  const onSubmit = form.handleSubmit((data) => {
    const userId = session?.user.id
    if (isLoadingPatient || !userId) return
    if (isError) {
      setPatientMutate({
        userId,
        insuranceType: data.insuranceType,
      })
      return
    }
    mutate({
      userId,
      insuranceType: data.insuranceType,
    })
  })

  return (
    <div className="mt-4 w-3/5">
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="insuranceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de seguro</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
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
          <Button
            type="submit"
            variant="secondary"
            className="mt-4"
            disabled={isPending || isSettingPatient}
          >
            {isPending || isSettingPatient ? (
              <Spinner className="mr-2" />
            ) : null}
            {isError ? 'Establecer información de paciente' : 'Actualizar'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

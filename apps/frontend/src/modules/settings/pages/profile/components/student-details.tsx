import { useSession } from '@frontend/hooks/use-session'
import type { StudentForm } from '@frontend/shared/models/person'
import { studentFormSchema } from '@frontend/shared/models/person'
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
import { Input } from '@workspace/ui/components/input'
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
import { useGetStudent } from '../hooks/use-get-student'
import { useSetStudent } from '../hooks/use-set-student'
import { useUpdateStudent } from '../hooks/use-update-student'

const gradeOptions: {
  label: string
  value: StudentForm['grade']
}[] = [
  { label: '4to Secundaria', value: '4to secundaria' },
  { label: '5to Secundaria', value: '5to secundaria' },
]

export default function StudentDetails() {
  const {
    data: student,
    isLoading: isLoadingStudent,
    isError,
  } = useGetStudent()
  const form = useForm<StudentForm>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      grade: '',
      guardianEmail: '',
    },
  })
  const { data: session } = useSession()

  const { mutate, isPending } = useUpdateStudent()
  const { mutate: setStudentMutate, isPending: isSettingStudent } =
    useSetStudent()

  useEffect(() => {
    if (!student) return
    form.reset({
      grade: student.grade ?? '',
      guardianEmail: student.guardianEmail ?? '',
    })
  }, [student, form])

  const onSubmit = form.handleSubmit((data) => {
    const userId = session?.user.id
    if (isLoadingStudent || !userId) return
    if (isError) {
      setStudentMutate({
        userId,
        grade: data.grade,
        guardianEmail: data.guardianEmail,
      })
      return
    }
    mutate({
      userId,
      grade: data.grade,
      guardianEmail: data.guardianEmail,
    })
  })

  return (
    <div className="my-4 w-3/5">
      <Form {...form}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado escolar</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un grado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gradeOptions.map((option) => (
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
          <Button
            type="submit"
            variant="secondary"
            className="mt-4"
            disabled={isPending || isSettingStudent}
          >
            {isPending || isSettingStudent ? (
              <Spinner className="mr-2" />
            ) : null}
            {isError ? 'Establecer información de estudiante' : 'Actualizar'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

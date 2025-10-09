import { useCreateOrganization } from '@frontend/modules/auth/pages/welcome/hooks/use-create-organization'
import { formUserSchema } from '@frontend/shared/models/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { SelectValue } from '@radix-ui/react-select'
import { getRouteApi, Link, useSearch } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import z from 'zod'

export default function FormView() {
  const viewType = useSearch({
    from: '/_authenticated/admin/users/form',
    select: (search) => search.type,
  })
  const loaderData = getRouteApi(
    '/_authenticated/admin/users/form',
  ).useLoaderData()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      documentType: 'DNI',
      documentNumber: '',
      birthDate: undefined,
      sex: undefined,
      regionId: undefined,
      teamId: undefined,
    },
  })

  const { mutate: createOrganization } = useCreateOrganization()

  // const { mutate: updateUser } = useUpdateUser()

  function onSubmit(values: z.infer<typeof formSchema>) {
    // if (viewType === 'edit' && loaderData?.id)
    // updateUser({
    //   userId: loaderData.id,
    //   data: {
    //     email: values.email,
    //     name: values.name,
    //     role: loaderData.role,
    //     password: '',
    //     surname: values.surname,
    //     documentType: values.documentType,
    //     documentNumber: values.documentNumber,
    //     sex: values.sex,
    //     birthDate: values.birthDate,
    //     phone: values.phone,
    //     regionId: values.regionId,
    //   },
    //   teamId:
    //     loaderData.teams[0]?.id !== values.teamId ? values.teamId : undefined,
    // })
    // else
    createOrganization({
      name: values.name,
      type: 'health',
    })
  }

  return (
    <div className="w-full p-4">
      <div className="mt-4 w-full md:w-3/5 mx-auto">
        <h1 className="text-2xl font-medium">
          {dependantText.mainTitle[viewType]}
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full flex gap-2 justify-center">
              <Button type="submit" className="mt-4">
                {dependantText.submit[viewType]}
              </Button>
              <Link to="/admin/users">
                <Button variant="outline" className="mt-4">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

const dependantText = {
  mainTitle: {
    new: 'Crear nuevo usuario',
    edit: 'Editar un usuario',
  },
  submit: {
    new: 'Crear Usuario',
    edit: 'Guardar Cambios',
  },
}

const formSchema = formUserSchema
  .omit({
    password: true,
    confirmPassword: true,
  })
  .extend({
    teamId: z.string(),
  })

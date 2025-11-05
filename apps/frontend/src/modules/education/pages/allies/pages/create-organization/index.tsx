import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearch } from '@tanstack/react-router'
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
import { Spinner } from '@workspace/ui/components/spinner'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { useCreateOrganization } from '../../hooks/use-create-organization'

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(50, { message: 'El nombre no puede tener más de 50 caracteres' }),
})

export default function OrganizationFormView() {
  const viewType = useSearch({
    from: '/_authenticated/education/organization/form',
    select: (search) => search.type,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const { mutate: createOrganization, isPending } = useCreateOrganization()

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: handle edit organization
    createOrganization({
      name: values.name,
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
                      <Input placeholder="Organización" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full flex gap-2 justify-center">
              <Button type="submit" className="mt-4" disabled={isPending}>
                {isPending ? <Spinner /> : dependantText.submit[viewType]}
              </Button>
              <Link to="/education/organization">
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
    new: 'Registrar nueva organización',
    edit: 'Editar una organización',
  },
  submit: {
    new: 'Registrar Organización',
    edit: 'Guardar Cambios',
  },
}

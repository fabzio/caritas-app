import { useRegions } from '@frontend/hooks/use-regions'
import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Separator } from '@workspace/ui/components/separator'
import { Spinner } from '@workspace/ui/components/spinner'
import { cn } from '@workspace/ui/lib/utils'
import { format, parseISO } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import usePostFair from './hooks/use-post-fair'
import { useUpdateFairs } from './hooks/use-update-fairs'
import { type FormFairSchema, formFairSchema } from './utils/fair'

export default function CreateFairPage() {
  const viewType = useSearch({
    from: '/_authenticated/education/fair/form',
    select: (s) => s.type,
  })
  const loaderData = getRouteApi(
    '/_authenticated/education/fair/form',
  ).useLoaderData()
  const form = useForm<FormFairSchema>({
    resolver: zodResolver(formFairSchema),
    defaultValues:
      viewType === 'edit' && loaderData
        ? {
            title: loaderData.title,
            date: new Date(
              loaderData.date.getTime() +
                loaderData.date.getTimezoneOffset() * 60000,
            ),
            address: loaderData.address,
            startTime: loaderData.startTime,
            endTime: loaderData.endTime,
            regionId: loaderData.regionId,
          }
        : {
            title: '',
            date: undefined,
            address: '',
            startTime: '08:30:00',
            endTime: '08:30:00',
            regionId: undefined,
          },
  })
  const today = new Date()
  const { data: districts, isLoading } = useRegions()
  const { mutate: createFair, isPending: isPendingCreate } = usePostFair()
  const { mutate: updateFair, isPending: isPendingUpdate } = useUpdateFairs()
  const { data: user } = useSession()
  const handleSubmit = form.handleSubmit((data) => {
    if (!user) return
    if (viewType === 'edit' && loaderData?.id) {
      const params = { ...data, id: loaderData.id }
      updateFair(params)
    } else {
      const params = { ...data, createdBy: user.user.id, active: true }
      createFair(params)
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {dependantText.mainTitle[viewType]}
        </h1>
        <span className="text-muted-foreground">
          Complete la información de la feria vocacional
        </span>
        <Separator />
      </div>
      <div>
        <div className=" flex justify-center ">
          <div className="w-full lg:w-3/4">
            <header>
              <h3 className="text-lg font-medium">
                Información de la Feria vocacional
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete todos los campos requeridos*
              </p>
            </header>
            <div>
              <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la feria vocacional*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="regionId"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Distrito</FormLabel>

                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-[200px] justify-between',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value
                                  ? districts?.find((d) => d.id === field.value)
                                      ?.name
                                  : 'Selecciona tu distrito'}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar distrito"
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron distritos.
                                </CommandEmpty>
                                <CommandGroup>
                                  {isLoading ? (
                                    <Loader2 className="animate-spin w-4 mx-auto" />
                                  ) : (
                                    districts?.map((district) => (
                                      <CommandItem
                                        value={district.name}
                                        key={district.id}
                                        onSelect={() => {
                                          form.setValue('regionId', district.id)
                                        }}
                                      >
                                        {district.name}
                                        <Check
                                          className={cn(
                                            'ml-auto',
                                            district.id === field.value
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                      </CommandItem>
                                    ))
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección de la feria *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de la feria</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline">
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent>
                            <Calendar
                              captionLayout="dropdown"
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={{
                                before: today,
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de inicio de la feria</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            defaultValue="08:30:00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de finalización de la feria</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            defaultValue="08:30:00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <footer className="flex justify-end gap-4 items-center">
                    <Link to="/education/fair">
                      <Button variant="outline" type="button">
                        Cancelar
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isPendingCreate || isPendingUpdate}
                    >
                      {isPendingCreate || isPendingUpdate ? (
                        <Spinner />
                      ) : (
                        dependantText.submit[viewType]
                      )}
                    </Button>
                  </footer>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
const dependantText = {
  mainTitle: {
    new: 'Registrar nueva Feria Vocacional',
    edit: 'Editar Feria Vocacional',
  },
  submit: {
    new: 'Registrar feria',
    edit: 'Guardar Cambios',
  },
}

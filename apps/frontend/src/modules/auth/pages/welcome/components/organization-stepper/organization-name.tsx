import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { useFormContext } from 'react-hook-form'

export default function OrganizationNameForm() {
  const form = useFormContext<{ name: string }>()
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la organización</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Escribe el nombre de tu organización"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}

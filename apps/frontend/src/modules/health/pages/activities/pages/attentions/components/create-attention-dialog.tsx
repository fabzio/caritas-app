import { useSession } from '@frontend/hooks/use-session'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Textarea } from '@workspace/ui/components/textarea'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  type UseCreateAttentionProps,
  useCreateAttention,
} from '../hooks/use-create-attention'
import type { UserAttention } from '../hooks/use-user-attentions.js'
import type { FormAttentionSchema } from '../models/attention-form'
import { formAttentionSchema } from '../models/attention-form'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attention: UserAttention | null
  userId: string
  participantName: string
}

export default function CreateAttentionDialog({
  open,
  onOpenChange,
  attention,
  userId,
  participantName,
}: Readonly<Props>) {
  const { data: session } = useSession()
  const myUser = session?.user?.id ?? ''

  const { mutate: createAttention, isPending: isCreating } =
    useCreateAttention()

  const form = useForm<FormAttentionSchema>({
    resolver: zodResolver(formAttentionSchema),
  })

  if (!attention) return null

  const handleSubmit = form.handleSubmit((data) => {
    const params: UseCreateAttentionProps = {
      observations: data.observations,
      userId,
      alliedParticipationId: attention.alliedParticipationId,
      registeredBy: myUser,
    }

    createAttention(params, {
      onSuccess: handleOpenChange,
    })
  })

  const handleOpenChange = () => {
    form.reset()
    onOpenChange(!open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Atención</DialogTitle>
          <DialogDescription>
            Va a registrar la atención para la especialidad{' '}
            <span className="font-semibold">
              {attention.specialityName ?? null}
            </span>{' '}
            ({attention.alliedName}) para{' '}
            <span className="font-semibold">{participantName}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Escriba alguna observación (opcional)..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenChange}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  'Registrar Atención'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

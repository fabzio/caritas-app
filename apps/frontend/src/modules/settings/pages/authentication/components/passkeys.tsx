import { useAddPasskey } from '@frontend/modules/settings/hooks/use-add-passkey'
import { useListPasskeys } from '@frontend/modules/settings/hooks/use-list-passkeys'
import { useRemovePasskey } from '@frontend/modules/settings/hooks/use-remove-passkey'
import { Button } from '@workspace/ui/components/button'
import { Trash } from 'lucide-react'

export default function Passkeys() {
  const { data: passkeys } = useListPasskeys()
  const { mutate } = useAddPasskey()
  const { mutate: removeMutate } = useRemovePasskey()

  return (
    <div className="my-4 flex flex-col items-start">
      <div className="w-full flex justify-end">
        <Button variant="link" className="w-fit" onClick={() => mutate()}>
          Agregar Llave de Acceso
        </Button>
      </div>
      {passkeys.length > 0 ? (
        passkeys.map((p) => (
          <div
            key={p.id}
            className="flex w-full justify-between items-center border-b"
          >
            <p>{p.name || 'Principal'}</p>
            <div className="flex">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeMutate(p.id)}
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p className="w-full text-center text-gray-500">
          No se configuraron llaves de acceso aún.
        </p>
      )}
    </div>
  )
}

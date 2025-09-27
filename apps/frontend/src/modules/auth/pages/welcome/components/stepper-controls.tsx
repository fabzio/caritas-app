import { Button } from '@workspace/ui/components/button'

type Props = {
  isFirst: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
}
export default function StepperControls({
  isFirst,
  isLast,
  onPrev,
}: Readonly<Props>) {
  return (
    <div className="flex justify-end gap-4">
      {!isFirst && (
        <Button type="button" variant="secondary" onClick={onPrev}>
          Anterior
        </Button>
      )}
      <Button type="submit">{isLast ? 'Finalizar' : 'Siguiente'}</Button>
    </div>
  )
}

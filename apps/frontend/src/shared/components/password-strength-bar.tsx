import { cn } from '@workspace/ui/lib/utils'

type Props = {
  password: string
}

type Criteria = {
  length: boolean
  case: boolean
  number: boolean
  special: boolean
}

export default function PasswordStrengthBar({ password }: Readonly<Props>) {
  const { score, label, criteria } = getPasswordStrength(password)
  const items = [
    { key: 'length', passed: criteria.length, text: 'Mínimo 8 caracteres' },
    { key: 'case', passed: criteria.case, text: 'Mayúsculas y minúsculas' },
    { key: 'number', passed: criteria.number, text: 'Incluye un número' },
    {
      key: 'special',
      passed: criteria.special,
      text: 'Incluye un carácter especial',
    },
  ]
  const passedList = items
    .filter((i) => i.passed)
    .map((i) => i.text)
    .join(', ')
  return (
    <>
      <div aria-hidden className="flex items-center gap-2 h-6">
        <div className="flex w-full gap-1 items-center">
          {Array.from({ length: 4 }, (_, idx) => idx).map((position) => {
            const filled = score > position
            return (
              <span
                key={position}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors',
                  filled ? 'bg-accent-foreground' : 'bg-muted',
                )}
              />
            )
          })}
        </div>
        <span className="text-sm text-muted-foreground w-28 text-right truncate whitespace-nowrap">
          {label}
        </span>
      </div>
      <ul
        className="mt-2 flex flex-col gap-1 text-sm"
        aria-label="Criterios de contraseña"
      >
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                'w-4 h-4 flex items-center justify-center rounded-full',
                item.passed
                  ? 'text-accent-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {item.passed ? '✓' : '○'}
            </span>
            <span
              className={cn(
                item.passed
                  ? 'text-accent-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>
      <div className="sr-only" aria-live="polite">
        {password
          ? `Fortaleza de contraseña: ${label}. Criterios cumplidos: ${passedList || 'ninguno'}`
          : ''}
      </div>
    </>
  )
}

const getPasswordStrength = (
  pwd: string,
): {
  score: number
  label: string
  criteria: Criteria
} => {
  if (!pwd)
    return {
      score: 0,
      label: '',
      criteria: { length: false, case: false, number: false, special: false },
    }
  const length = pwd.length >= 8
  const caseMix = /[A-Z]/.test(pwd) && /[a-z]/.test(pwd)
  const number = /\d/.test(pwd)
  const special = /[^A-Za-z0-9]/.test(pwd)
  const criteria = { length, case: caseMix, number, special }
  const score =
    Number(length) + Number(caseMix) + Number(number) + Number(special)
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte']
  return { score, label: labels[score] ?? '', criteria }
}

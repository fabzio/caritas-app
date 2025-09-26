import { cn } from '@workspace/ui/lib/utils'

type Props = {
  password: string
}

export default function PasswordStrengthBar({ password }: Readonly<Props>) {
  const { score, label } = getPasswordStrength(password)
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
      <div className="sr-only" aria-live="polite">
        {password ? `Fortaleza de contraseña: ${label}` : ''}
      </div>
    </>
  )
}
const getPasswordStrength = (
  pwd: string,
): {
  score: number
  label: string
} => {
  if (!pwd) return { score: 0, label: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte']
  return { score, label: labels[score] ?? '' }
}

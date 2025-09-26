import { Turnstile } from '@marsidev/react-turnstile'
import { env } from '@/env'
import { useTheme } from './theme-provider'

type Props = {
  onSuccess?: (token: string) => void
}
export default function TurnstileWidget({ onSuccess }: Readonly<Props>) {
  const { theme } = useTheme()
  return (
    <Turnstile
      className="flex justify-center"
      siteKey={env.VITE_CLOUDFARE_TURNSTILE_SITE_KEY}
      options={{
        theme: theme === 'system' ? 'auto' : theme,
        language: 'es',
      }}
      onSuccess={onSuccess}
    />
  )
}

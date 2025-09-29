import { Turnstile } from '@marsidev/react-turnstile'
import type { ComponentProps } from 'react'
import { env } from '@/env'
import { useTheme } from './theme-provider'

type Props = Omit<ComponentProps<typeof Turnstile>, 'siteKey' | 'options'>

export default function TurnstileWidget(props: Readonly<Props>) {
  const { theme } = useTheme()
  return (
    <Turnstile
      className="flex justify-center"
      siteKey={env.VITE_CLOUDFARE_TURNSTILE_SITE_KEY}
      options={{
        theme: theme === 'system' ? 'auto' : theme,
        language: 'es',
      }}
      {...props}
    />
  )
}

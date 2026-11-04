import { env } from '@frontend/env'
import { Turnstile } from '@marsidev/react-turnstile'
import { type ComponentProps, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useTheme } from './theme-provider'

type Props = Omit<ComponentProps<typeof Turnstile>, 'siteKey' | 'options'>

export default function TurnstileWidget(props: Readonly<Props>) {
  const { theme } = useTheme()
  const hasTriggeredDevelopmentSuccess = useRef(false)

  useEffect(() => {
    if (
      import.meta.env.MODE !== 'development' ||
      hasTriggeredDevelopmentSuccess.current
    )
      return
    hasTriggeredDevelopmentSuccess.current = true
    props.onSuccess?.('development-bypass')
  }, [props.onSuccess])

  if (import.meta.env.MODE === 'development') return null

  return (
    <Turnstile
      ref={props.ref}
      className="flex justify-center"
      siteKey={env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
      options={{
        theme: theme === 'system' ? 'auto' : theme,
        language: 'es',
      }}
      onClickCapture={() => toast.info('Validando...')}
      {...props}
    />
  )
}

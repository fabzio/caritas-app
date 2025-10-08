import caritaslima from '@frontend/assets/img/login/caritaslima.webp'
import ModeToggle from '@frontend/shared/components/mode-toggle'
import { Badge } from '@workspace/ui/components/badge'
import type { PropsWithChildren } from 'react'

export default function AuthLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex  gap-2 justify-between">
          <span className="flex items-center gap-2 font-medium">
            <div className="flex items-start justify-center rounded-md">
              <img
                src="/logo.png"
                alt="Cáritas"
                className="h-full aspect-auto"
              />
              <Badge>365</Badge>
            </div>
          </span>
          <ModeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={caritaslima}
          alt="Placeholder"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.6]"
        />
      </div>
    </div>
  )
}

import { Link } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import type { PropsWithChildren } from 'react'
import { useSession } from '@/hooks/use-session'
import type { ValidRoutes } from '@/shared/types/valid-routes'
import getShortname from '@/shared/utils/get-shortname'

type Props = PropsWithChildren
export default function UserSettingsLayout({ children }: Readonly<Props>) {
  const { data } = useSession()
  return (
    <article className="flex flex-col flex-1 px-4">
      <header className="flex items-center gap-4">
        <Avatar>
          <AvatarImage />
          <AvatarFallback>
            {data &&
              getShortname({
                firstName: data.user.name,
                lastName: data.user.surname,
              })}
          </AvatarFallback>
        </Avatar>
        <div>
          {data && (
            <p className="text-lg font-medium leading-none">{`${data.user.name} ${data.user.surname}`}</p>
          )}
          {data && (
            <span className="text-sm text-muted-foreground">
              {data.user.email}
            </span>
          )}
        </div>
      </header>
      <div className="flex flex-col md:flex-row flex-1 mt-4">
        <aside className="flex flex-col gap-2 px-2">
          {subRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="text-sm"
              activeProps={{
                className: 'text-accent-foreground ',
              }}
              activeOptions={{
                exact: true,
              }}
            >
              {route.label}
            </Link>
          ))}
        </aside>

        <main className="flex-1 px-2 md:px-36">{children}</main>
      </div>
    </article>
  )
}

const subRoutes: {
  path: ValidRoutes
  label: string
}[] = [
  {
    path: '/user/settings',
    label: 'Perfil',
  },
  {
    path: '/user/settings/authentication',
    label: 'Autenticación',
  },
]

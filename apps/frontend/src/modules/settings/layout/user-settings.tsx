import { useSession } from '@frontend/hooks/use-session'
import type { ValidRoutes } from '@frontend/shared/types/valid-routes'
import getShortname from '@frontend/shared/utils/get-shortname'
import { Link, useSearch } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { ChevronLeft } from 'lucide-react'
import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren
export default function UserSettingsLayout({ children }: Readonly<Props>) {
  const { redirect } = useSearch({ from: '/_authenticated/settings' })
  const { data } = useSession()
  return (
    <article className="flex flex-col flex-1 p-4">
      <Link to={redirect} className="flex gap-2 py-4 w-fit">
        <ChevronLeft />
        Volver
      </Link>
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
        <aside className="flex flex-col gap-2 pl-8">
          {subRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              search={{
                redirect: redirect,
              }}
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
    path: '/settings',
    label: 'Perfil',
  },
  {
    path: '/settings/authentication',
    label: 'Autenticación',
  },
]

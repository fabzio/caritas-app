import { env } from '@frontend/env'
import authClient from '@frontend/lib/authClient'
import { useLocation, useNavigate } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu.tsx'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar.tsx'
import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ValidRoutes } from '../types/valid-routes'

type Props = {
  platforms: {
    name: string
    logo: React.ElementType
    path: ValidRoutes
    accessKey:
      | 'admin'
      | 'health'
      | 'education'
      | 'organization'
      | 'beneficiary'
      | 'user'
  }[]
}
function PlatformSwitcher({ platforms }: Readonly<Props>) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { isMobile } = useSidebar()
  const [selectedPlatform, setSelectedPlatform] = useState(
    platforms.find((platform) => pathname.startsWith(platform.path)) ||
      platforms[0],
  )

  const onChangePlatform = async (platform: typeof selectedPlatform) => {
    const { data: organizations, error } = await authClient.organization.list()
    if (error) {
      toast.error('Error al cambiar de módulo')
      return
    }
    if (['admin', 'health', 'education'].includes(platform.accessKey)) {
      const targetOrg = organizations?.find((org) => org.type === 'caritas')
      if (!targetOrg) {
        toast.error('No se encontró la organización destino')
        return
      }
      await authClient.organization.setActive({ organizationId: targetOrg.id })
    } else {
      await authClient.organization.setActive({
        organizationId: organizations?.[0]?.id || '',
      })
    }
    setSelectedPlatform(platform)
    navigate({
      to: platform.path,
    })
  }
  if (!platforms.length) return null
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={platforms.length < 2}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground disabled:opacity-100 disabled:hover:opacity-100"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <selectedPlatform.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {selectedPlatform.name}
                </span>
                <span className="truncate text-xs">{env.VITE_ORG_NAME}</span>
              </div>
              {platforms.length > 1 && <ChevronsUpDown className="ml-auto" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Módulos
            </DropdownMenuLabel>
            {platforms.map((platform) => (
              <DropdownMenuItem
                key={platform.name}
                className="gap-2 p-2"
                onClick={() => onChangePlatform(platform)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <platform.logo className="size-3.5 shrink-0" />
                </div>
                {platform.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default PlatformSwitcher

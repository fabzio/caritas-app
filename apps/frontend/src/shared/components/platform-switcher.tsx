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

type Props = {
  platforms: {
    name: string
    logo: React.ElementType
  }[]
}
function PlatformSwitcher({ platforms }: Readonly<Props>) {
  const { isMobile } = useSidebar()
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0])
  if (!selectedPlatform) return null
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <selectedPlatform.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {selectedPlatform.name}
                </span>
                <span className="truncate text-xs">Cáritas Lima</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
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
                onClick={() => setSelectedPlatform(platform)}
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

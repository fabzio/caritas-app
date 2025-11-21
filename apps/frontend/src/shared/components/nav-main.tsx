import { useSession } from '@frontend/hooks/use-session'
import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from '@workspace/ui/components/sidebar'
import { Building2, ChevronRight } from 'lucide-react'
import type { NonUndefined } from 'react-hook-form'
import { toast } from 'sonner'
import { QueryKeys } from '../constants/query-keys'
import type { NavItem } from '../types/nav-main'
import {
  type OrganizationType,
  redirectByProperties,
} from '../utils/redirect-by-properties'

type Props = {
  items: NavItem[]
}

const organizationTypes: OrganizationType[] = [
  'caritas',
  'health',
  'education',
  'beneficiary',
]

const isOrganizationType = (value: string): value is OrganizationType =>
  organizationTypes.includes(value as OrganizationType)

function NavMain({ items }: Readonly<Props>) {
  const { setOpenMobile, setOpen } = useSidebar()
  const navigate = useNavigate()
  const { data: memberRoleData } = authClient.useActiveMemberRole()
  const { data: sessionData } = useSession()
  const { data: orgs, isLoading } = useQuery({
    queryKey: [QueryKeys.ORGANIZATIONS],
    queryFn: async () => {
      const { data, error } = await rpc
        .users({
          id: sessionData?.user.id || '',
        })
        .organizations.get()
      if (error) throw error
      return data
    },
  })
  const groupLabel =
    items.find((item) => item.groupLabel)?.groupLabel || 'Navegación'

  const handleChangeOrganization = async (
    newOrg: NonNullable<typeof orgs>[number],
  ) => {
    if (!newOrg) return
    const organizationType = isOrganizationType(newOrg.type)
      ? newOrg.type
      : null
    await authClient.organization.setActive({
      organizationId: newOrg.id,
    })
    if (organizationType === 'caritas') {
      const { data: teams, error } = await authClient.organization.listTeams()
      const filteredTeams =
        teams?.filter(
          (team) => team?.id === sessionData?.session.activeTeamId,
        ) ?? []
      if (error) {
        toast.error(error.message)
        return
      }
      const route = redirectByProperties({
        role: memberRoleData?.role ?? null,
        organizationType,
        teams: filteredTeams,
      })
      navigate({ to: route })
      return
    }

    const route = redirectByProperties({
      role: memberRoleData?.role ?? null,
      organizationType,
    })
    navigate({ to: route })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              to={subItem.url}
                              onClick={() => {
                                setOpen(false)
                                setOpenMobile(false)
                              }}
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link
                  to={item.url as NonUndefined<typeof item.url>}
                  onClick={() => {
                    setOpen(false)
                    setOpenMobile(false)
                  }}
                  activeProps={{
                    className: 'text-accent-foreground bg-primary/10',
                  }}
                  activeOptions={{
                    exact: true,
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
        {!isLoading && orgs && orgs.length > 0 && (
          <>
            <SidebarSeparator />
            <Collapsible
              key="organizations"
              asChild
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Mis Organizaciones">
                    <Building2 />
                    <span>Mis Organizaciones</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {orgs.map((org) => (
                      <SidebarMenuSubItem key={org.id}>
                        <SidebarMenuSubButton
                          onClick={() => handleChangeOrganization(org)}
                        >
                          <span>{org.name}</span>
                          {org.type && (
                            <span className="ml-auto text-xs italic text-muted-foreground">
                              {
                                mapTypeLabel[
                                  org.type as keyof typeof mapTypeLabel
                                ]
                              }
                            </span>
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
const mapTypeLabel = {
  caritas: 'Cáritas',
  health: 'Salud',
  education: 'Educación',
  beneficiary: 'Beneficiario',
}
export default NavMain

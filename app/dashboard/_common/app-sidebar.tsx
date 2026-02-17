import { TraceLogo } from "@/components/trace-logo"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Home } from "lucide-react"
import Link from "next/link"


const AppSidebar = () => {
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
  ]
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/">
          <TraceLogo textClassName="text-white!" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}


export default AppSidebar
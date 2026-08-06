"use client"

import React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from 'next/image'
import { Database, Headphones, LayoutDashboard, User2Icon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MenuOptions = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'AI Agents',
        url: '/dashboard/my-agents',
        icon: Headphones
    },
    {
        title: 'Data',
        url: '/dashboard/data',
        icon: Database
    },
    {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: User2Icon
    },

]

function AppSidebar() {
    const { open } = useSidebar();
    const path = usePathname();

    return (
    <Sidebar collapsible='icon'>
        <SidebarHeader>
            <div className='flex gap-2 items-center'>
                <Image src={'/logo.svg'} alt='logo' width={35} height={35} />
                {open && <h2 className='font-bold'>Automata</h2>}
            </div>
        </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {MenuOptions.map((menu, index) => (
                        <SidebarMenuItem key = {index}>
                            <SidebarMenuButton asChild size={open ? 'lg' : 'default'}
                            isActive={path == menu.url}>
                                <Link href={menu.url}>
                                    <menu.icon/>
                                    <span>{menu.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar

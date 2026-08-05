"use client"

import React, { useContext, useEffect } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { Database, Gem, Headphones, LayoutDashboard, User2Icon, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { UserDetailContext } from '@/context/UserDetailContext'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useConvex } from 'convex/react'
import { api } from '@/convex/_generated/api'

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
        url: '#',
        icon: Database
    },
    {
        title: 'Pricing',
        url: '/dashboard/pricing',
        icon: WalletCards
    },
    {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: User2Icon
    },

]

function AppSidebar() {
    const { open } = useSidebar();
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const path = usePathname();

    const {has} = useAuth();

    const isPaidUser = has&&has({ plan: 'unlimited_plan' })
    console.log("isPaidUser", isPaidUser);

    const convex = useConvex();
    const [totalRemainingCredits, setTotalRemainingCredits] = React.useState<number>(0);

    // Depend on the stable _id, not the userDetail object itself: this effect
    // calls setUserDetail below, which creates a new object — depending on
    // [userDetail] made the effect re-trigger itself in an infinite loop.
    useEffect(() => {
        if (!isPaidUser && userDetail?._id) {
            GetUserAgent();
        }
    }, [userDetail?._id])

    const GetUserAgent = async () => {
        const result = await convex.query(api.agent.GetUserAgents, {
            userId: userDetail?._id
        });
        setTotalRemainingCredits(7 - Number(result?.length || 0));
        setUserDetail((prev:any)=>({...prev, remainingCredits: 7 - Number(result?.length || 0)}))
        console.log(result);
    }



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
      <SidebarFooter className='mb-10'>
        {/* 🌟 FIXED: Added '!' to check if the user is NOT paid */}
        {!isPaidUser ? (
            <div className="flex flex-col gap-4">
                <div className='flex gap-2 items-center'>
                    <Gem />
                    {open && <h2> Remaining Credits: 
                        <span className='font-bold'> {totalRemainingCredits} / 7</span>  
                    </h2>}
                </div>
                
                {open && (
                    <Button className='mt-2'>
                        Upgrade to Unlimited
                    </Button>
                )}
            </div>
        ) : (
            /* 🌟 Show this block ONLY if they ARE a paid user */
            <div className="flex gap-2 items-center px-2">
                <Gem className="text-blue-500" />
                {open && <h2 className="text-sm font-semibold">You have Unlimited Agents</h2>}
            </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
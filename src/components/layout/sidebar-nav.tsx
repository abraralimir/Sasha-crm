
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, MessageSquare, Users, Video, ClipboardList, CircleDollarSign, Layers, GanttChart, Users2, Clock, Briefcase, Shield, ChevronDown } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Logo, LogoIcon } from '@/components/logo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { ChatGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';


const mainMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/attendance', label: 'Attendance', icon: Clock },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/projects', label: 'Projects', icon: Layers },
  { href: '/project-tasks', label: 'Project Tasks', icon: GanttChart },
  { href: '/resources', label: 'Resources', icon: Users2 },
  { href: '/tickets', label: 'Tickets', icon: ClipboardList },
  { href: '/financials', label: 'Financials', icon: CircleDollarSign },
  { href: '/hr', label: 'HR', icon: Briefcase },
  { href: '/chat', label: 'Collaboration', icon: MessageSquare },
  { href: '/conference', label: 'Conference', icon: Video },
  { href: '/admin0012', label: 'Admin', icon: Shield, admin: true },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = user?.email === 'alimirabrar@gmail.com';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="hidden group-data-[collapsible=icon]:block">
            <LogoIcon />
        </div>
        <div className="block group-data-[collapsible=icon]:hidden">
            <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {mainMenuItems.map(({ href, label, icon: Icon, admin }) => {
            if (admin && !isAdmin) return null;
            return (
                <SidebarMenuItem key={href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))}
                    tooltip={label}
                >
                    <Link href={href}>
                    <Icon />
                    <span>{label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className='p-2 text-center text-xs text-sidebar-foreground/70'>
            © {new Date().getFullYear()} SashaLeads AI
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

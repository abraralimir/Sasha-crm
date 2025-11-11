
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
  { href: '/conference', label: 'Conference', icon: Video },
  { href: '/admin0012', label: 'Admin', icon: Shield, admin: true },
];

function ChatGroupNav() {
    const pathname = usePathname();
    const { user } = useUser();
    const firestore = useFirestore();

    const groupsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
          collection(firestore, 'groups'),
          where('members', 'array-contains', user.uid)
        );
    }, [firestore, user]);

    const { data: groups, isLoading } = useCollection<ChatGroup>(groupsQuery);

    return (
        <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton className='w-full' isActive={pathname.startsWith('/chat')}>
                    <MessageSquare />
                    <span>Collaboration</span>
                    <ChevronDown className='ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className='pl-8 pr-2 py-1 space-y-1 group-data-[collapsible=icon]:hidden'>
                    {isLoading && (
                        <>
                            <Skeleton className="h-7 w-full" />
                            <Skeleton className="h-7 w-full" />
                        </>
                    )}
                    {groups?.map((group) => (
                         <Link
                            key={group.id}
                            href={`/chat/${group.id}`}
                            className={cn(
                                "block p-2 text-sm rounded-md",
                                pathname === `/chat/${group.id}` ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : 'hover:bg-sidebar-accent/50'
                            )}
                            >
                           {group.name}
                        </Link>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}


export function SidebarNav() {
  const pathname = usePathname();

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
          {mainMenuItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(href)}
                tooltip={label}
              >
                <Link href={href}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           <SidebarMenuItem>
             <ChatGroupNav />
           </SidebarMenuItem>
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

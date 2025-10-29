import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BotMessageSquare, Home, LayoutGrid, MessageSquare, Users, Video } from 'lucide-react';

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

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/chat', label: 'Collaboration', icon: MessageSquare },
  { href: '/conference', label: 'Conference', icon: Video },
];

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
          {menuItems.map(({ href, label, icon: Icon }) => (
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

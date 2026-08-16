import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookText, FileText, LayoutGrid, Package, Settings, ShoppingCart, Store, Tags, Ticket, Users } from 'lucide-react';

const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [{ title: 'Dashboard', url: '/admin', icon: LayoutGrid }],
    },
    {
        title: 'Catalog',
        items: [
            { title: 'Products', url: '/admin/products', icon: Package },
            { title: 'Collections', url: '/admin/collections', icon: Tags },
        ],
    },
    {
        title: 'Sales',
        items: [
            { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
            { title: 'Customers', url: '/admin/customers', icon: Users },
            { title: 'Coupons', url: '/admin/coupons', icon: Ticket },
        ],
    },
    {
        title: 'Content',
        items: [
            { title: 'Pages', url: '/admin/pages', icon: FileText },
            { title: 'Blogs', url: '/admin/blogs', icon: BookText },
        ],
    },
    {
        title: 'Configuration',
        items: [{ title: 'Settings', url: '/admin/settings', icon: Settings }],
    },
];

export function AdminSidebar() {
    const { url } = usePage();

    /**
     * The dashboard lives at the prefix root, so it only matches exactly;
     * every other section also matches its nested create/edit screens.
     */
    const isActive = (itemUrl: string): boolean => (itemUrl === '/admin' ? url === '/admin' : url.startsWith(itemUrl));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Store className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Store admin</span>
                                    <span className="text-muted-foreground truncate text-xs">Meds To Your Doors</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.title} className="px-2 py-0">
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={{ children: item.title }}>
                                        <Link href={item.url} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={{ children: 'View storefront' }}>
                            <a href="/" target="_blank" rel="noopener noreferrer">
                                <Store />
                                <span>View storefront</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

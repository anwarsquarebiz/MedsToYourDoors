import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: AuthUser | null;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer';
    is_admin: boolean;
    email_verified_at: string | null;
    avatar?: string | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface StoreInfo {
    name: string;
    email: string;
    phone: string;
    currency: string;
    social: Record<string, string>;
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
}

export interface NavLink {
    title: string;
    url: string;
}

/** Storefront navigation, shared on every storefront request. */
export interface StorefrontNavigation {
    collections: NavLink[];
    pages: NavLink[];
}

/** Lightweight cart totals shared on every request for the header badge. */
export interface CartSummary {
    item_count: number;
    subtotal: Money;
}

export interface SharedData {
    name: string;
    auth: Auth;
    store: StoreInfo;
    flash: FlashMessages;
    navigation?: StorefrontNavigation;
    cart?: CartSummary;
    quote?: { message: string; author: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role?: 'admin' | 'customer';
    phone?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

/**
 * A monetary amount serialised by App\Support\Money. `amount` is in minor units
 * (for example cents); use `formatted` for display and `decimal` for form inputs.
 */
export interface Money {
    amount: number;
    currency: string;
    formatted: string;
    decimal: string;
}

/** Laravel's length-aware paginator, as returned to Inertia. */
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface SelectOption {
    value: string;
    label: string;
}

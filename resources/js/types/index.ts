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

export interface IdOption {
    value: number;
    label: string;
}

export interface SeoMeta {
    title: string;
    description?: string | null;
}

/* Catalog ---------------------------------------------------------------- */

export type ProductStatus = 'draft' | 'active' | 'archived';
export type PublishStatus = 'draft' | 'published';
export type InventoryPolicyValue = 'deny' | 'continue';

export interface ProductImage {
    id: number;
    url: string;
    alt: string | null;
    position: number;
    product_variant_id: number | null;
}

export interface ProductVariant {
    id: number;
    title: string;
    display_title: string;
    sku: string | null;
    barcode: string | null;
    price: Money;
    compare_at_price: Money | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    option_values: string[];
    inventory_quantity: number;
    track_inventory: boolean;
    inventory_policy: InventoryPolicyValue;
    weight: string | null;
    weight_unit: string;
    position: number;
    in_stock: boolean;
    low_stock: boolean;
    on_sale: boolean;
    max_quantity: number;
}

export interface ProductOption {
    id: number;
    name: string;
    position: number;
    values: string[];
}

/** A product as rendered in a grid. */
export interface ProductSummary {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    vendor: string | null;
    product_type: string | null;
    url: string;
    price_from: Money;
    compare_at_price: Money | null;
    on_sale: boolean;
    in_stock: boolean;
    variant_count: number;
    image: { url: string; alt: string } | null;
}

export interface ProductDetail {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    body_html: string | null;
    status: ProductStatus;
    vendor: string | null;
    product_type: string | null;
    seo_title: string | null;
    seo_description: string | null;
    meta_title: string;
    meta_description: string | null;
    published_at: string | null;
    is_published: boolean;
    in_stock: boolean;
    url: string;
    variants: ProductVariant[];
    images: ProductImage[];
    options: ProductOption[];
    collections?: CollectionSummary[];
}

export interface CollectionSummary {
    id: number;
    title: string;
    slug: string;
    url: string;
    image_url: string | null;
}

export interface CollectionDetail {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    status: PublishStatus;
    seo_title: string | null;
    seo_description: string | null;
    meta_title: string;
    meta_description: string | null;
    position: number;
    published_at: string | null;
    is_published: boolean;
    image_url: string | null;
    url: string;
    products_count?: number;
    product_ids?: number[];
}

/** Admin listing row, as produced by ProductRepository::paginateForAdmin(). */
export interface AdminProductRow {
    id: number;
    title: string;
    slug: string;
    status: ProductStatus;
    vendor: string | null;
    product_type: string | null;
    published_at: string | null;
    variants_count: number;
    min_price_amount: number | null;
    total_inventory: number | null;
    images: ProductImage[];
}

export interface CatalogFilters {
    search?: string | null;
    sort?: string | null;
    in_stock?: boolean | null;
    min_price?: string | null;
    max_price?: string | null;
}

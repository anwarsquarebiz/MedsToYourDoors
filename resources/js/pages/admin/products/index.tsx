import { StatusBadge } from '@/components/admin/status-badge';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { type AdminProductRow, type BreadcrumbItem, type IdOption, type Paginated, type SelectOption } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ImageOff, Plus, Search } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Products', href: '/admin/products' },
];

interface AdminProductsIndexProps {
    products: Paginated<AdminProductRow>;
    filters: { search: string | null; status: string | null; collection_id: number | null; sort: string | null };
    statuses: SelectOption[];
    collections: IdOption[];
}

/** Minor units to a display string; the admin list uses the raw aggregate. */
const formatMinor = (amount: number | null): string => (amount === null ? '—' : `$${(amount / 100).toFixed(2)}`);

export default function AdminProductsIndex({ products, filters, statuses, collections }: AdminProductsIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const apply = (overrides: Record<string, unknown>) => {
        const next = { ...filters, search, ...overrides };

        router.get('/admin/products', Object.fromEntries(Object.entries(next).filter(([, value]) => value !== null && value !== '')), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        apply({});
    };

    return (
        <AdminLayout
            breadcrumbs={breadcrumbs}
            title="Products"
            description="Manage your catalog, pricing and stock."
            actions={
                <Button asChild>
                    <Link href="/admin/products/create">
                        <Plus className="mr-1 size-4" />
                        New product
                    </Link>
                </Button>
            }
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form onSubmit={submit} className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search title, vendor or SKU"
                        aria-label="Search products"
                        className="pl-9"
                    />
                </form>

                <select
                    value={filters.status ?? ''}
                    onChange={(event) => apply({ status: event.target.value || null })}
                    aria-label="Filter by status"
                    className="h-9 rounded-md border border-neutral-300 bg-transparent px-3 text-sm dark:border-neutral-700"
                >
                    <option value="">All statuses</option>
                    {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.collection_id ?? ''}
                    onChange={(event) => apply({ collection_id: event.target.value || null })}
                    aria-label="Filter by collection"
                    className="h-9 rounded-md border border-neutral-300 bg-transparent px-3 text-sm dark:border-neutral-700"
                >
                    <option value="">All collections</option>
                    {collections.map((collection) => (
                        <option key={collection.value} value={collection.value}>
                            {collection.label}
                        </option>
                    ))}
                </select>
            </div>

            {products.data.length === 0 ? (
                <div className="rounded-xl border border-neutral-200 p-12 text-center dark:border-neutral-800">
                    <p className="font-medium">No products yet</p>
                    <p className="text-muted-foreground mt-1 text-sm">Create your first product to start selling.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Product
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Price
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Stock
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Variants
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right font-medium">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {products.data.map((product) => (
                                    <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
                                                    {product.images[0] ? (
                                                        <img
                                                            src={product.images[0].url}
                                                            alt={product.images[0].alt ?? product.title}
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex size-full items-center justify-center text-neutral-400">
                                                            <ImageOff className="size-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:underline">
                                                        {product.title}
                                                    </Link>
                                                    {product.vendor && <p className="text-muted-foreground truncate text-xs">{product.vendor}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge label={product.status} status={product.status} />
                                        </td>
                                        <td className="px-4 py-3">{formatMinor(product.min_price_amount)}</td>
                                        <td className="px-4 py-3">
                                            <span className={product.total_inventory === 0 ? 'text-rose-600 dark:text-rose-400' : ''}>
                                                {product.total_inventory ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{product.variants_count}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Pagination paginator={products} />
        </AdminLayout>
    );
}

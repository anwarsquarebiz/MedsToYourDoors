import { Pagination } from '@/components/pagination';
import { CatalogToolbar } from '@/components/storefront/catalog-toolbar';
import { ProductCard } from '@/components/storefront/product-card';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type CatalogFilters, type Paginated, type ProductSummary, type SeoMeta } from '@/types';
import { Head } from '@inertiajs/react';
import { PackageOpen } from 'lucide-react';

interface ProductsIndexProps {
    products: Paginated<ProductSummary>;
    filters: CatalogFilters;
    seo: SeoMeta;
}

export default function ProductsIndex({ products, filters, seo }: ProductsIndexProps) {
    return (
        <StorefrontLayout>
            <Head title={seo.title}>{seo.description && <meta name="description" content={seo.description} />}</Head>

            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
                <header className="mb-6 space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">All products</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">Everything currently available in our store.</p>
                </header>

                <CatalogToolbar filters={filters} baseUrl="/products" resultCount={products.meta.total} />

                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 text-center">
                        <PackageOpen className="size-10 text-neutral-400" />
                        <p className="font-medium">No products found</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Try a different search or clear your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {products.data.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        <div className="mt-10">
                            <Pagination paginator={products} />
                        </div>
                    </>
                )}
            </div>
        </StorefrontLayout>
    );
}

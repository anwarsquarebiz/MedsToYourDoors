import { type ProductSummary } from '@/types';
import { Link } from '@inertiajs/react';
import { ImageOff } from 'lucide-react';

export function ProductCard({ product }: { product: ProductSummary }) {
    return (
        <Link
            href={product.url}
            prefetch
            className="group flex flex-col gap-3 rounded-xl border border-neutral-200 p-3 transition-shadow hover:shadow-md dark:border-neutral-800"
        >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                {product.image ? (
                    <img
                        src={product.image.url}
                        alt={product.image.alt}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-neutral-400">
                        <ImageOff className="size-8" />
                    </div>
                )}

                {product.on_sale && (
                    <span className="absolute top-2 left-2 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">Sale</span>
                )}

                {!product.in_stock && (
                    <span className="absolute top-2 right-2 rounded-full bg-neutral-900/85 px-2 py-0.5 text-xs font-semibold text-white">
                        Sold out
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-1">
                {product.vendor && <p className="text-xs tracking-wide text-neutral-500 uppercase dark:text-neutral-400">{product.vendor}</p>}
                <p className="font-medium group-hover:underline">{product.title}</p>

                <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="font-semibold">
                        {product.variant_count > 1 && <span className="text-xs font-normal text-neutral-500">from </span>}
                        {product.price_from.formatted}
                    </span>
                    {product.compare_at_price && (
                        <span className="text-sm text-neutral-500 line-through dark:text-neutral-400">{product.compare_at_price.formatted}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

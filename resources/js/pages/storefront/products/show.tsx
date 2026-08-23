import InputError from '@/components/input-error';
import { ProductDetailsContent } from '@/components/storefront/product-details-content';
import { Button } from '@/components/ui/button';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type Money, type ProductDetail, type ProductOption, type ProductVariant, type SeoMeta } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    ImageOff,
    Lock,
    Minus,
    Package,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Truck,
} from 'lucide-react';
import { type FormEventHandler, useEffect, useMemo, useRef, useState } from 'react';

interface ProductShowProps {
    product: { data: ProductDetail };
    seo: SeoMeta;
}

const trustPoints = [
    { icon: Truck, label: 'Discreet, tracked shipping' },
    { icon: ShieldCheck, label: 'Licensed pharmacy partners' },
    { icon: Package, label: 'Plain packaging on every order' },
    { icon: Lock, label: 'Secure checkout' },
] as const;

/** Nested JsonResource collections may arrive as `{ data: T[] }` under Inertia. */
function unwrapList<T>(value: T[] | { data: T[] } | undefined | null): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && Array.isArray(value.data)) {
        return value.data;
    }

    return [];
}

/** The option value a variant holds at the given 1-based option position. */
const optionValueAt = (variant: ProductVariant, position: number): string | null =>
    position === 1 ? variant.option1 : position === 2 ? variant.option2 : variant.option3;

function listedOptionValues(values: ProductOption['values'] | string | null | undefined): string[] {
    if (Array.isArray(values)) {
        return values.filter((value) => value.trim() !== '');
    }

    if (typeof values === 'string' && values.trim() !== '') {
        return values
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value !== '');
    }

    return [];
}

function uniqueVariantValues(variants: ProductVariant[], position: number): string[] {
    const seen = new Set<string>();

    for (const variant of variants) {
        const value = optionValueAt(variant, position);

        if (value) {
            seen.add(value);
        }
    }

    return [...seen];
}

/**
 * Options the customer can pick from. Missing option values are filled in from
 * the variants so a product still shows choices when values were not stored.
 */
function optionsForPicker(options: ProductOption[], variants: ProductVariant[]): ProductOption[] {
    return options
        .map((option) => {
            const listed = listedOptionValues(option.values);

            return {
                ...option,
                values: listed.length > 0 ? listed : uniqueVariantValues(variants, option.position),
            };
        })
        .filter((option) => option.values.length > 0);
}

function initialSelection(options: ProductOption[], variant: ProductVariant | undefined): Record<number, string> {
    if (!variant) {
        return {};
    }

    return options.reduce<Record<number, string>>((carry, option) => {
        const value = optionValueAt(variant, option.position);

        if (value) {
            carry[option.position] = value;
        } else if (option.values[0]) {
            carry[option.position] = option.values[0];
        }

        return carry;
    }, {});
}

function savingsPercent(price: Money, compareAt: Money | null | undefined): number | null {
    if (!compareAt || compareAt.amount <= price.amount) {
        return null;
    }

    return Math.round(((compareAt.amount - price.amount) / compareAt.amount) * 100);
}

function shortBlurb(text: string | null | undefined, maxLength = 140): string | null {
    if (!text) {
        return null;
    }

    const normalized = text
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^What is [^?]+\?\s*/i, '');

    if (normalized.length === 0) {
        return null;
    }

    if (normalized.length <= maxLength) {
        return normalized;
    }

    const truncated = normalized.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return `${truncated.slice(0, lastSpace > 80 ? lastSpace : maxLength).trimEnd()}…`;
}

function formatOptionLabel(name: string, value: string): string {
    const numeric = Number(value);

    if (Number.isFinite(numeric) && String(numeric) === value.trim()) {
        const lower = name.toLowerCase();

        if (
            lower.includes('pack') ||
            lower.includes('quantity') ||
            lower.includes('count') ||
            lower.includes('size') ||
            lower.includes('pill') ||
            lower.includes('tablet') ||
            lower.includes('capsule')
        ) {
            const unit = lower.includes('capsule') ? 'capsules' : lower.includes('pill') ? 'pills' : 'tablets';

            return `${value} ${unit}`;
        }
    }

    return value;
}

function variantMatchingSelection(
    variants: ProductVariant[],
    pickers: ProductOption[],
    selected: Record<number, string>,
    override?: { position: number; value: string },
): ProductVariant | undefined {
    const next = override ? { ...selected, [override.position]: override.value } : selected;

    return variants.find((variant) => pickers.every((option) => optionValueAt(variant, option.position) === next[option.position]));
}

/** Lowest price-per-unit among numeric pack sizes (single-option products). */
function bestValueOptionValue(option: ProductOption, variants: ProductVariant[], pickers: ProductOption[]): string | null {
    if (pickers.length !== 1) {
        return null;
    }

    let bestValue: string | null = null;
    let bestUnitCost = Number.POSITIVE_INFINITY;

    for (const value of option.values) {
        const count = Number(value);

        if (!Number.isFinite(count) || count <= 0 || String(count) !== value.trim()) {
            continue;
        }

        const matched = variantMatchingSelection(variants, pickers, {}, { position: option.position, value });

        if (!matched?.in_stock) {
            continue;
        }

        const unitCost = matched.price.amount / count;

        if (unitCost < bestUnitCost) {
            bestUnitCost = unitCost;
            bestValue = value;
        }
    }

    return bestValue;
}

function pickerButtonClass(isSelected: boolean, unavailable = false): string {
    return `flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
        isSelected
            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
            : 'border-neutral-300 bg-white hover:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950'
    } ${unavailable ? 'opacity-50' : ''}`;
}

export default function ProductShow({ product, seo }: ProductShowProps) {
    const { data: item } = product;
    const variants = unwrapList(item.variants);
    const pickers = optionsForPicker(unwrapList(item.options), variants);
    const showVariantList = pickers.length === 0 && variants.length > 1;
    const collections = unwrapList(item.collections);

    const [selected, setSelected] = useState<Record<number, string>>(() => initialSelection(pickers, variants[0]));
    const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(variants[0]?.id);

    /** The variant matching every selected option, falling back to the first. */
    const activeVariant = useMemo<ProductVariant | undefined>(() => {
        if (pickers.length > 0) {
            return variantMatchingSelection(variants, pickers, selected) ?? variants[0];
        }

        return variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
    }, [pickers, variants, selected, selectedVariantId]);

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const buyBoxRef = useRef<HTMLDivElement>(null);
    const [showStickyBuy, setShowStickyBuy] = useState(false);

    const form = useForm<{ product_variant_id: number; quantity: number }>({
        product_variant_id: activeVariant?.id ?? 0,
        quantity: 1,
    });

    const addToCart = () => {
        if (!activeVariant?.in_stock) {
            return;
        }

        form.transform(() => ({ product_variant_id: activeVariant.id, quantity }));
        form.post('/cart/items', { preserveScroll: true });
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        addToCart();
    };

    const maxQuantity = Math.max(1, activeVariant?.max_quantity ?? 1);
    const images = item.images;
    const salePercent = activeVariant ? savingsPercent(activeVariant.price, activeVariant.compare_at_price) : null;
    const blurb = shortBlurb(item.description);
    const canPurchase = Boolean(activeVariant?.in_stock);

    useEffect(() => {
        setQuantity((current) => Math.min(current, maxQuantity));
    }, [maxQuantity]);

    useEffect(() => {
        const node = buyBoxRef.current;

        if (!node || typeof IntersectionObserver === 'undefined') {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyBuy(!entry.isIntersecting);
            },
            { threshold: 0.15 },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const addToCartLabel = canPurchase ? (form.processing ? 'Adding…' : 'Add to cart') : 'Sold out';

    return (
        <StorefrontLayout>
            <Head title={seo.title}>{seo.description && <meta name="description" content={seo.description} />}</Head>

            <div className="border-b border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/40">
                <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
                    <nav aria-label="Breadcrumb" className="text-sm text-neutral-500 dark:text-neutral-400">
                        <Link href="/products" prefetch className="hover:text-neutral-900 dark:hover:text-white">
                            Products
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-neutral-900 dark:text-white">{item.title}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
                <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-100 to-neutral-50 ring-1 ring-neutral-200/80 dark:from-neutral-900 dark:to-neutral-950 dark:ring-neutral-800">
                            {images.length > 0 ? (
                                <img
                                    src={images[activeImage]?.url}
                                    alt={images[activeImage]?.alt ?? item.title}
                                    className="size-full object-contain p-4 sm:p-8"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center text-neutral-400">
                                    <ImageOff className="size-12" />
                                </div>
                            )}

                            {activeVariant?.on_sale && salePercent !== null && (
                                <span className="absolute top-4 left-4 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                    Save {salePercent}%
                                </span>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        aria-label={`View image ${index + 1}`}
                                        aria-pressed={index === activeImage}
                                        className={`aspect-square overflow-hidden rounded-xl border-2 bg-neutral-50 transition-colors dark:bg-neutral-900 ${
                                            index === activeImage
                                                ? 'border-neutral-900 dark:border-white'
                                                : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                                        }`}
                                    >
                                        <img src={image.url} alt={image.alt ?? ''} className="size-full object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div ref={buyBoxRef} className="flex flex-col gap-5 lg:sticky lg:top-24">
                        <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                                {canPurchase ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                                        <Check className="size-3.5" />
                                        {activeVariant?.low_stock
                                            ? `Only ${activeVariant.inventory_quantity} left`
                                            : 'In stock — ready to ship'}
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                                        Currently sold out
                                    </span>
                                )}
                            </div>

                            {item.vendor && item.vendor.toLowerCase() !== 'my store' && (
                                <p className="text-sm tracking-wide text-neutral-500 uppercase dark:text-neutral-400">{item.vendor}</p>
                            )}

                            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl">{item.title}</h1>

                            <div className="flex flex-wrap items-baseline gap-3 pt-1">
                                <span className="text-3xl font-semibold tracking-tight">{activeVariant?.price.formatted}</span>
                                {activeVariant?.compare_at_price && activeVariant.on_sale && (
                                    <>
                                        <span className="text-lg text-neutral-500 line-through dark:text-neutral-400">
                                            {activeVariant.compare_at_price.formatted}
                                        </span>
                                        {salePercent !== null && (
                                            <span className="text-sm font-medium text-rose-700 dark:text-rose-400">
                                                You save {salePercent}%
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            {blurb && (
                                <p className="max-w-prose text-base leading-relaxed text-neutral-600 dark:text-neutral-300">{blurb}</p>
                            )}

                            {(item.body_html || (item.description && item.description.length > 140)) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDetailsOpen(true);
                                        document.getElementById('product-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="text-sm font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-white"
                                >
                                    View full product details
                                </button>
                            )}
                        </div>

                        <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-5">
                            {pickers.map((option) => {
                                const bestValue = bestValueOptionValue(option, variants, pickers);

                                return (
                                    <fieldset key={option.id} className="space-y-2.5">
                                        <legend className="text-sm font-semibold">
                                            {option.name}
                                            {selected[option.position] && (
                                                <span className="ml-2 font-normal text-neutral-500 dark:text-neutral-400">
                                                    {formatOptionLabel(option.name, selected[option.position])}
                                                </span>
                                            )}
                                        </legend>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {option.values.map((value) => {
                                                const isSelected = selected[option.position] === value;
                                                const matched = variantMatchingSelection(variants, pickers, selected, {
                                                    position: option.position,
                                                    value,
                                                });
                                                const unavailable = matched ? !matched.in_stock : false;
                                                const isBestValue = bestValue === value;

                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        aria-pressed={isSelected}
                                                        onClick={() => setSelected((current) => ({ ...current, [option.position]: value }))}
                                                        className={`${pickerButtonClass(isSelected, unavailable)} relative`}
                                                    >
                                                        {isBestValue && (
                                                            <span
                                                                className={`absolute -top-2 right-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                                                                    isSelected
                                                                        ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white'
                                                                        : 'bg-teal-700 text-white'
                                                                }`}
                                                            >
                                                                Best value
                                                            </span>
                                                        )}
                                                        <span className="font-medium">{formatOptionLabel(option.name, value)}</span>
                                                        {pickers.length === 1 && matched && (
                                                            <span
                                                                className={`text-xs ${isSelected ? 'opacity-80' : 'text-neutral-500 dark:text-neutral-400'}`}
                                                            >
                                                                {matched.price.formatted}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                );
                            })}

                            {showVariantList && (
                                <fieldset className="space-y-2.5">
                                    <legend className="text-sm font-semibold">Choose an option</legend>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                        {variants.map((variant) => {
                                            const isSelected = activeVariant?.id === variant.id;

                                            return (
                                                <button
                                                    key={variant.id}
                                                    type="button"
                                                    aria-pressed={isSelected}
                                                    onClick={() => setSelectedVariantId(variant.id)}
                                                    className={pickerButtonClass(isSelected, !variant.in_stock)}
                                                >
                                                    <span className="font-medium">{variant.display_title}</span>
                                                    <span className={`text-xs ${isSelected ? 'opacity-80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                                        {variant.price.formatted}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                            )}

                            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:flex-row sm:items-end">
                                <div className="space-y-2">
                                    <span className="text-sm font-semibold">Quantity</span>
                                    <div className="flex w-fit items-center rounded-lg border border-neutral-300 dark:border-neutral-700">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                            disabled={quantity <= 1}
                                            aria-label="Decrease quantity"
                                            className="p-2.5 disabled:opacity-40"
                                        >
                                            <Minus className="size-4" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                                            disabled={quantity >= maxQuantity}
                                            aria-label="Increase quantity"
                                            className="p-2.5 disabled:opacity-40"
                                        >
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={!canPurchase || form.processing}
                                    className="h-11 flex-1 text-base sm:min-w-[12rem]"
                                >
                                    <ShoppingBag className="mr-2 size-4" />
                                    {addToCartLabel}
                                </Button>
                            </div>

                            <InputError message={form.errors.product_variant_id ?? form.errors.quantity} />

                            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                                Free shipping on orders over $50. Ships in discreet packaging. Prescription medicines should be used only as directed by a healthcare professional.
                            </p>
                        </form>

                        <ul className="grid gap-3 sm:grid-cols-2">
                            {trustPoints.map(({ icon: Icon, label }) => (
                                <li
                                    key={label}
                                    className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-900">
                                        <Icon className="size-4" />
                                    </span>
                                    {label}
                                </li>
                            ))}
                        </ul>

                        {collections.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-neutral-500 dark:text-neutral-400">Collections:</span>
                                {collections.map((collection) => (
                                    <Link
                                        key={collection.id}
                                        href={collection.url}
                                        prefetch
                                        className="rounded-full border border-neutral-200 px-3 py-1 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
                                    >
                                        {collection.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {(item.body_html || item.description) && (
                    <section id="product-details" className="mt-14 scroll-mt-28 border-t border-neutral-200 pt-10 dark:border-neutral-800">
                        <div className="mx-auto max-w-4xl">
                            <button
                                type="button"
                                onClick={() => setDetailsOpen((open) => !open)}
                                className="flex w-full items-center justify-between gap-4 text-left"
                                aria-expanded={detailsOpen}
                            >
                                <h2 className="text-2xl font-semibold tracking-tight">Product details</h2>
                                <ChevronDown
                                    className={`size-5 shrink-0 text-neutral-500 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {detailsOpen ? (
                                item.body_html ? (
                                    <ProductDetailsContent html={item.body_html} />
                                ) : (
                                    <p className="mt-6 whitespace-pre-line leading-relaxed text-neutral-600 dark:text-neutral-300">
                                        {item.description}
                                    </p>
                                )
                            ) : (
                                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                                    Benefits, dosage guidance, side effects, and safety information.
                                </p>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {showStickyBuy && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 p-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 lg:hidden">
                    <div className="mx-auto flex max-w-7xl items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <p className="text-base font-semibold">{activeVariant?.price.formatted}</p>
                        </div>
                        <Button type="button" size="lg" disabled={!canPurchase || form.processing} onClick={addToCart} className="shrink-0">
                            <ShoppingBag className="mr-2 size-4" />
                            {addToCartLabel}
                        </Button>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}

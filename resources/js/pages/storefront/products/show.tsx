import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type ProductDetail, type ProductOption, type ProductVariant, type SeoMeta } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, ImageOff, Minus, Plus, ShoppingBag } from 'lucide-react';
import { type FormEventHandler, useEffect, useMemo, useState } from 'react';

interface ProductShowProps {
    product: { data: ProductDetail };
    seo: SeoMeta;
}

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

function pickerButtonClass(isSelected: boolean, unavailable = false): string {
    return `rounded-lg border px-4 py-2 text-sm transition-colors ${
        isSelected
            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
            : 'border-neutral-300 hover:border-neutral-500 dark:border-neutral-700'
    } ${unavailable ? 'opacity-50' : ''}`;
}

export default function ProductShow({ product, seo }: ProductShowProps) {
    const { data: item } = product;
    const variants = unwrapList(item.variants);
    const pickers = optionsForPicker(unwrapList(item.options), variants);
    const showVariantList = pickers.length === 0 && variants.length > 1;

    const [selected, setSelected] = useState<Record<number, string>>(() => initialSelection(pickers, variants[0]));
    const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(variants[0]?.id);

    /** The variant matching every selected option, falling back to the first. */
    const activeVariant = useMemo<ProductVariant | undefined>(() => {
        if (pickers.length > 0) {
            return (
                variants.find((variant) =>
                    pickers.every((option) => optionValueAt(variant, option.position) === selected[option.position]),
                ) ?? variants[0]
            );
        }

        return variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
    }, [pickers, variants, selected, selectedVariantId]);

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const form = useForm<{ product_variant_id: number; quantity: number }>({
        product_variant_id: activeVariant?.id ?? 0,
        quantity: 1,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (!activeVariant) {
            return;
        }

        form.transform(() => ({ product_variant_id: activeVariant.id, quantity }));
        form.post('/cart/items', { preserveScroll: true });
    };

    const maxQuantity = Math.max(1, activeVariant?.max_quantity ?? 1);
    const images = item.images;

    useEffect(() => {
        setQuantity((current) => Math.min(current, maxQuantity));
    }, [maxQuantity]);

    return (
        <StorefrontLayout>
            <Head title={seo.title}>{seo.description && <meta name="description" content={seo.description} />}</Head>

            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
                <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                    <Link href="/products" className="hover:text-neutral-900 dark:hover:text-white">
                        Products
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-neutral-900 dark:text-white">{item.title}</span>
                </nav>

                <div className="grid gap-10 lg:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                            {images.length > 0 ? (
                                <img
                                    src={images[activeImage]?.url}
                                    alt={images[activeImage]?.alt ?? item.title}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center text-neutral-400">
                                    <ImageOff className="size-12" />
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        aria-label={`View image ${index + 1}`}
                                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                                            index === activeImage ? 'border-neutral-900 dark:border-white' : 'border-transparent'
                                        }`}
                                    >
                                        <img src={image.url} alt={image.alt ?? ''} className="size-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                            {item.vendor && <p className="text-sm tracking-wide text-neutral-500 uppercase dark:text-neutral-400">{item.vendor}</p>}
                            <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>

                            <div className="flex items-baseline gap-3 pt-2">
                                <span className="text-2xl font-semibold">{activeVariant?.price.formatted}</span>
                                {activeVariant?.compare_at_price && activeVariant.on_sale && (
                                    <span className="text-neutral-500 line-through dark:text-neutral-400">
                                        {activeVariant.compare_at_price.formatted}
                                    </span>
                                )}
                            </div>

                            {activeVariant?.sku && <p className="text-xs text-neutral-500 dark:text-neutral-400">SKU: {activeVariant.sku}</p>}
                        </div>

                        {item.description && <p className="text-neutral-600 dark:text-neutral-300">{item.description}</p>}

                        {pickers.map((option) => (
                            <fieldset key={option.id} className="space-y-2">
                                <legend className="text-sm font-medium">{option.name}</legend>
                                <div className="flex flex-wrap gap-2">
                                    {option.values.map((value) => {
                                        const isSelected = selected[option.position] === value;

                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                aria-pressed={isSelected}
                                                onClick={() => setSelected((current) => ({ ...current, [option.position]: value }))}
                                                className={pickerButtonClass(isSelected)}
                                            >
                                                {value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        ))}

                        {showVariantList && (
                            <fieldset className="space-y-2">
                                <legend className="text-sm font-medium">Variant</legend>
                                <div className="flex flex-wrap gap-2">
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
                                                <span>{variant.display_title}</span>
                                                <span className="ml-2 text-xs opacity-80">{variant.price.formatted}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        )}

                        {activeVariant?.in_stock ? (
                            <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                                <Check className="size-4" />
                                {activeVariant.low_stock ? `Only ${activeVariant.inventory_quantity} left` : 'In stock'}
                            </p>
                        ) : (
                            <p className="text-sm text-rose-700 dark:text-rose-400">Currently sold out</p>
                        )}

                        <form onSubmit={submit} className="flex flex-col gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">Quantity</span>
                                <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                        className="p-2 disabled:opacity-40"
                                    >
                                        <Minus className="size-4" />
                                    </button>
                                    <span className="w-10 text-center text-sm" aria-live="polite">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                                        disabled={quantity >= maxQuantity}
                                        aria-label="Increase quantity"
                                        className="p-2 disabled:opacity-40"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" size="lg" disabled={!activeVariant?.in_stock || form.processing} className="w-full sm:w-auto">
                                <ShoppingBag className="mr-2 size-4" />
                                {activeVariant?.in_stock ? 'Add to cart' : 'Sold out'}
                            </Button>
                            <InputError message={form.errors.product_variant_id ?? form.errors.quantity} />
                        </form>

                        {item.body_html && (
                            <div
                                className="prose prose-neutral dark:prose-invert max-w-none border-t border-neutral-200 pt-6 dark:border-neutral-800"
                                dangerouslySetInnerHTML={{ __html: item.body_html }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}

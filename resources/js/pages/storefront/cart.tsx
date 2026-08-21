import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type CartDetail, type CartLine, type SeoMeta } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ImageOff, Loader2, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { type FormEventHandler } from 'react';

interface CartPageProps {
    cart: { data: CartDetail } | null;
    seo: SeoMeta;
}

export default function CartPage({ cart, seo }: CartPageProps) {
    const detail = cart?.data ?? null;
    const isEmpty = detail === null || detail.items.length === 0;

    return (
        <StorefrontLayout>
            <Head title={seo.title}>{seo.description && <meta name="description" content={seo.description} />}</Head>

            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
                <h1 className="mb-8 text-3xl font-semibold tracking-tight">Your cart</h1>

                {isEmpty ? <EmptyCart /> : <CartContents cart={detail} />}
            </div>
        </StorefrontLayout>
    );
}

function EmptyCart() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-300 py-20 text-center dark:border-neutral-700">
            <span className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
                <ShoppingBag className="size-6" />
            </span>
            <div className="space-y-1">
                <p className="font-medium">Your cart is empty</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Browse the catalogue to find what you need.</p>
            </div>
            <Button asChild>
                <Link href="/products">Shop all products</Link>
            </Button>
        </div>
    );
}

function CartContents({ cart }: { cart: CartDetail }) {
    const { totals, coupon } = cart;

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <ul className="divide-y divide-neutral-200 lg:col-span-2 dark:divide-neutral-800">
                {cart.items.map((line) => (
                    <CartRow key={line.id} line={line} />
                ))}
            </ul>

            <aside className="h-fit space-y-5 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                <h2 className="text-lg font-semibold">Order summary</h2>

                <CouponForm coupon={coupon} discounted={totals.discount.amount > 0} />

                <dl className="space-y-2 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800">
                    <div className="flex justify-between">
                        <dt className="text-neutral-600 dark:text-neutral-400">Subtotal</dt>
                        <dd>{totals.subtotal.formatted}</dd>
                    </div>

                    {totals.discount.amount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <dt>Discount {totals.coupon_code && `(${totals.coupon_code})`}</dt>
                            <dd>-{totals.discount.formatted}</dd>
                        </div>
                    )}

                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <dt>Shipping</dt>
                        <dd>Calculated at checkout</dd>
                    </div>

                    <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold dark:border-neutral-800">
                        <dt>Total</dt>
                        <dd>{totals.total.formatted}</dd>
                    </div>
                </dl>

                <Button asChild size="lg" className="w-full">
                    <Link href="/checkout">Checkout</Link>
                </Button>

                <Link href="/products" className="block text-center text-sm text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-400">
                    Continue shopping
                </Link>
            </aside>
        </div>
    );
}

function CartRow({ line }: { line: CartLine }) {
    const setQuantity = (quantity: number) => {
        router.patch(
            `/cart/items/${line.id}`,
            { quantity },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <li className="flex gap-4 py-6">
            <Link href={line.product.url} className="size-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                {line.image ? (
                    <img src={line.image.url} alt={line.image.alt} loading="lazy" className="size-full object-cover" />
                ) : (
                    <div className="flex size-full items-center justify-center text-neutral-400">
                        <ImageOff className="size-6" />
                    </div>
                )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <Link href={line.product.url} className="font-medium underline-offset-4 hover:underline">
                            {line.product.title}
                        </Link>
                        {line.variant.options.length > 0 && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{line.variant.options.join(' / ')}</p>
                        )}
                        {line.variant.sku && <p className="text-xs text-neutral-500 dark:text-neutral-500">SKU {line.variant.sku}</p>}
                    </div>

                    <p className="shrink-0 font-medium">{line.line_total.formatted}</p>
                </div>

                {!line.in_stock && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">Not enough stock for this quantity. Reduce it to continue.</p>
                )}

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-neutral-200 dark:border-neutral-800">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-r-none"
                            aria-label="Decrease quantity"
                            onClick={() => setQuantity(line.quantity - 1)}
                        >
                            <Minus className="size-4" />
                        </Button>
                        <span className="w-10 text-center text-sm tabular-nums">{line.quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-l-none"
                            aria-label="Increase quantity"
                            disabled={line.quantity >= line.max_quantity}
                            onClick={() => setQuantity(line.quantity + 1)}
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-neutral-600 hover:text-red-600 dark:text-neutral-400"
                        onClick={() =>
                            router.delete(`/cart/items/${line.id}`, {
                                preserveScroll: true,
                            })
                        }
                    >
                        <Trash2 className="size-4" />
                        Remove
                    </Button>
                </div>
            </div>
        </li>
    );
}

function CouponForm({ coupon, discounted }: { coupon: CartDetail['coupon']; discounted: boolean }) {
    const form = useForm<{ code: string }>({ code: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        form.post('/cart/coupon', {
            preserveScroll: true,
            onSuccess: () => form.reset('code'),
        });
    };

    if (coupon && discounted) {
        return (
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/40">
                <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                    <Tag className="size-4" />
                    {coupon.code} · {coupon.value} off
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Remove discount code"
                    onClick={() => router.delete('/cart/coupon', { preserveScroll: true })}
                >
                    <X className="size-4" />
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={form.data.code}
                    onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                    placeholder="Discount code"
                    aria-label="Discount code"
                    autoComplete="off"
                />
                <Button type="submit" variant="secondary" disabled={form.processing || form.data.code.trim() === ''}>
                    {form.processing ? <Loader2 className="size-4 animate-spin" /> : 'Apply'}
                </Button>
            </div>

            {form.errors.code && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.code}</p>}

            {coupon && !discounted && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                    {coupon.code} is no longer eligible for this cart.
                </p>
            )}
        </form>
    );
}

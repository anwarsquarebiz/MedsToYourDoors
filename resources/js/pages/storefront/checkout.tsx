import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type AddressRecord, type CartDetail, type SeoMeta, type ShippingQuote, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

interface CheckoutPageProps {
    cart: { data: CartDetail };
    shipping_methods: ShippingQuote[];
    addresses: { data: AddressRecord[] } | AddressRecord[];
    customer: { email: string; phone: string | null; name: string } | null;
    tax_rate_basis_points: number;
    guest_checkout_enabled: boolean;
    seo: SeoMeta;
}

interface AddressFields {
    first_name: string;
    last_name: string;
    company: string;
    address_line1: string;
    address_line2: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone: string;
}

const emptyAddress = (): AddressFields => ({
    first_name: '',
    last_name: '',
    company: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    country_code: 'US',
    phone: '',
});

const unwrapAddresses = (value: CheckoutPageProps['addresses']): AddressRecord[] =>
    Array.isArray(value) ? value : (value.data ?? []);

export default function CheckoutPage({
    cart,
    shipping_methods,
    addresses,
    customer,
    tax_rate_basis_points,
    guest_checkout_enabled,
    seo,
}: CheckoutPageProps) {
    const { auth } = usePage<SharedData>().props;
    const saved = unwrapAddresses(addresses);
    const firstMethod = shipping_methods[0];

    const form = useForm({
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        shipping_method_id: firstMethod?.id ?? 0,
        customer_note: '',
        save_address: Boolean(auth.user),
        billing_same_as_shipping: true,
        shipping: emptyAddress(),
        billing: emptyAddress(),
    });

    const selectedShipping = shipping_methods.find((method) => method.id === Number(form.data.shipping_method_id));
    const merchandise = cart.data.totals.total.amount;
    const shippingAmount = selectedShipping?.amount.amount ?? 0;
    const taxAmount = Math.round(((merchandise + shippingAmount) * tax_rate_basis_points) / 10000);
    const grandTotal = merchandise + shippingAmount + taxAmount;

    const format = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: cart.data.currency }).format(amount / 100);

    const applySaved = (address: AddressRecord) => {
        form.setData('shipping', {
            first_name: address.first_name,
            last_name: address.last_name,
            company: address.company ?? '',
            address_line1: address.address_line1,
            address_line2: address.address_line2 ?? '',
            city: address.city,
            province: address.province ?? '',
            postal_code: address.postal_code,
            country_code: address.country_code,
            phone: address.phone ?? '',
        });
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/checkout');
    };

    const fieldError = (path: string) => (form.errors as Record<string, string>)[path];

    const needsLogin = !auth.user && !guest_checkout_enabled;

    return (
        <StorefrontLayout>
            <Head title={seo.title} />

            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
                <h1 className="mb-8 text-3xl font-semibold tracking-tight">Checkout</h1>

                {needsLogin ? (
                    <div className="rounded-xl border border-neutral-200 p-8 text-center dark:border-neutral-800">
                        <p className="font-medium">Please sign in to complete your purchase.</p>
                        <Button asChild className="mt-4">
                            <Link href="/login">Sign in</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <section className="space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                                <h2 className="font-medium">Contact</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                                        {form.errors.email && <p className="text-sm text-red-600">{form.errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                                <h2 className="font-medium">Shipping address</h2>
                                {saved.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {saved.map((address) => (
                                            <Button key={address.id} type="button" variant="outline" size="sm" onClick={() => applySaved(address)}>
                                                {address.one_line}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                                <AddressForm prefix="shipping" values={form.data.shipping} onChange={(next) => form.setData('shipping', next)} error={fieldError} />
                            </section>

                            <section className="space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                                <h2 className="font-medium">Shipping method</h2>
                                {shipping_methods.length === 0 ? (
                                    <p className="text-sm text-neutral-600">No shipping methods are configured.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {shipping_methods.map((method) => (
                                            <label key={method.id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-800">
                                                <span className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="shipping_method_id"
                                                        checked={Number(form.data.shipping_method_id) === method.id}
                                                        onChange={() => form.setData('shipping_method_id', method.id)}
                                                    />
                                                    <span>
                                                        <span className="font-medium">{method.name}</span>
                                                        {method.description && <span className="text-muted-foreground block text-xs">{method.description}</span>}
                                                    </span>
                                                </span>
                                                <span>{method.amount.formatted}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {form.errors.shipping_method_id && <p className="text-sm text-red-600">{form.errors.shipping_method_id}</p>}
                            </section>

                            {auth.user && (
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.save_address}
                                        onChange={(event) => form.setData('save_address', event.target.checked)}
                                    />
                                    Save this address to my account
                                </label>
                            )}

                            <Button type="submit" size="lg" disabled={form.processing || shipping_methods.length === 0}>
                                Place order
                            </Button>
                        </div>

                        <aside className="h-fit space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                            <h2 className="font-medium">Order summary</h2>
                            <ul className="space-y-2 text-sm">
                                {cart.data.items.map((line) => (
                                    <li key={line.id} className="flex justify-between gap-4">
                                        <span>
                                            {line.product.title} × {line.quantity}
                                        </span>
                                        <span>{line.line_total.formatted}</span>
                                    </li>
                                ))}
                            </ul>
                            <dl className="space-y-2 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800">
                                <div className="flex justify-between">
                                    <dt>Subtotal</dt>
                                    <dd>{cart.data.totals.subtotal.formatted}</dd>
                                </div>
                                {cart.data.totals.discount.amount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <dt>Discount</dt>
                                        <dd>-{cart.data.totals.discount.formatted}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt>Shipping</dt>
                                    <dd>{format(shippingAmount)}</dd>
                                </div>
                                {taxAmount > 0 && (
                                    <div className="flex justify-between">
                                        <dt>Tax</dt>
                                        <dd>{format(taxAmount)}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold dark:border-neutral-800">
                                    <dt>Total</dt>
                                    <dd>{format(grandTotal)}</dd>
                                </div>
                            </dl>
                        </aside>
                    </form>
                )}
            </div>
        </StorefrontLayout>
    );
}

function AddressForm({
    prefix,
    values,
    onChange,
    error,
}: {
    prefix: string;
    values: AddressFields;
    onChange: (next: AddressFields) => void;
    error: (path: string) => string | undefined;
}) {
    const set = (key: keyof AddressFields, value: string) => onChange({ ...values, [key]: value });

    const fields: Array<{ key: keyof AddressFields; label: string; className?: string }> = [
        { key: 'first_name', label: 'First name' },
        { key: 'last_name', label: 'Last name' },
        { key: 'address_line1', label: 'Address', className: 'sm:col-span-2' },
        { key: 'address_line2', label: 'Apartment, suite, etc.', className: 'sm:col-span-2' },
        { key: 'city', label: 'City' },
        { key: 'province', label: 'State / province' },
        { key: 'postal_code', label: 'Postal code' },
        { key: 'country_code', label: 'Country' },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
                <div key={field.key} className={`space-y-2 ${field.className ?? ''}`}>
                    <Label htmlFor={`${prefix}.${field.key}`}>{field.label}</Label>
                    <Input
                        id={`${prefix}.${field.key}`}
                        value={values[field.key]}
                        onChange={(event) => set(field.key, field.key === 'country_code' ? event.target.value.toUpperCase() : event.target.value)}
                    />
                    {error(`${prefix}.${field.key}`) && <p className="text-sm text-red-600">{error(`${prefix}.${field.key}`)}</p>}
                </div>
            ))}
        </div>
    );
}

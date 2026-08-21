import { FormCard, FormField } from '@/components/admin/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type SelectOption } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

interface ShippingMethodRow {
    id: number;
    name: string;
    description: string | null;
    type: string;
    type_label: string;
    rate: { formatted: string; decimal: string };
    free_over: { formatted: string; decimal: string } | null;
    is_active: boolean;
    position: number;
}

interface AdminSettingsProps {
    settings: Record<string, unknown>;
    shipping_methods: { data: ShippingMethodRow[] } | ShippingMethodRow[];
    shipping_types: SelectOption[];
}

const str = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

export default function AdminSettings({ settings, shipping_methods, shipping_types }: AdminSettingsProps) {
    const methods = Array.isArray(shipping_methods) ? shipping_methods : shipping_methods.data;
    const form = useForm({
        store: {
            name: str(settings['store.name']),
            email: str(settings['store.email']),
            phone: str(settings['store.phone']),
            address: str(settings['store.address']),
        },
        checkout: {
            tax_rate_basis_points: Number(settings['checkout.tax_rate_basis_points'] ?? 0),
            guest_checkout_enabled: Boolean(settings['checkout.guest_checkout_enabled']),
        },
        seo: {
            default_title: str(settings['seo.default_title']),
            default_description: str(settings['seo.default_description']),
        },
        social: {
            facebook: str(settings['social.facebook']),
            instagram: str(settings['social.instagram']),
            twitter: str(settings['social.twitter']),
        },
    });

    const shippingForm = useForm({
        name: 'Standard shipping',
        description: '',
        type: 'flat_rate',
        rate: '5.99',
        free_over: '',
        is_active: true,
        position: 1,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.put('/admin/settings');
    };

    const addShipping: FormEventHandler = (event) => {
        event.preventDefault();
        shippingForm.post('/admin/shipping-methods', { onSuccess: () => shippingForm.reset() });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Settings', href: '/admin/settings' },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs} title="Settings" description="Store, checkout, shipping and SEO.">
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
                <FormCard title="Store">
                    <FormField label="Name" htmlFor="store_name">
                        <Input id="store_name" value={form.data.store.name} onChange={(event) => form.setData('store', { ...form.data.store, name: event.target.value })} />
                    </FormField>
                    <FormField label="Email" htmlFor="store_email">
                        <Input id="store_email" value={form.data.store.email} onChange={(event) => form.setData('store', { ...form.data.store, email: event.target.value })} />
                    </FormField>
                    <FormField label="Phone" htmlFor="store_phone">
                        <Input id="store_phone" value={form.data.store.phone} onChange={(event) => form.setData('store', { ...form.data.store, phone: event.target.value })} />
                    </FormField>
                </FormCard>
                <FormCard title="Checkout">
                    <FormField label="Tax rate (basis points)" htmlFor="tax" hint="1000 = 10%.">
                        <Input
                            id="tax"
                            type="number"
                            value={form.data.checkout.tax_rate_basis_points}
                            onChange={(event) =>
                                form.setData('checkout', { ...form.data.checkout, tax_rate_basis_points: Number(event.target.value) })
                            }
                        />
                    </FormField>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.checkout.guest_checkout_enabled}
                            onChange={(event) => form.setData('checkout', { ...form.data.checkout, guest_checkout_enabled: event.target.checked })}
                        />
                        Allow guest checkout
                    </label>
                </FormCard>
                <FormCard title="SEO defaults">
                    <FormField label="Default title" htmlFor="seo_title">
                        <Input
                            id="seo_title"
                            value={form.data.seo.default_title}
                            onChange={(event) => form.setData('seo', { ...form.data.seo, default_title: event.target.value })}
                        />
                    </FormField>
                    <FormField label="Default description" htmlFor="seo_description">
                        <Input
                            id="seo_description"
                            value={form.data.seo.default_description}
                            onChange={(event) => form.setData('seo', { ...form.data.seo, default_description: event.target.value })}
                        />
                    </FormField>
                </FormCard>
                <div className="lg:col-span-2">
                    <Button type="submit" disabled={form.processing}>
                        Save settings
                    </Button>
                </div>
            </form>

            <section className="space-y-4">
                <h2 className="text-lg font-medium">Shipping methods</h2>
                <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                    {methods.map((method) => (
                        <li key={method.id} className="flex items-center justify-between px-4 py-3 text-sm">
                            <span>
                                {method.name} · {method.rate.formatted}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => router.delete(`/admin/shipping-methods/${method.id}`)}>
                                Remove
                            </Button>
                        </li>
                    ))}
                </ul>
                <form onSubmit={addShipping} className="grid gap-3 rounded-xl border border-neutral-200 p-4 sm:grid-cols-4 dark:border-neutral-800">
                    <Input placeholder="Name" value={shippingForm.data.name} onChange={(event) => shippingForm.setData('name', event.target.value)} />
                    <select
                        value={shippingForm.data.type}
                        onChange={(event) => shippingForm.setData('type', event.target.value)}
                        className="h-9 rounded-md border border-neutral-300 bg-transparent px-3 text-sm dark:border-neutral-700"
                    >
                        {shipping_types.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <Input placeholder="Rate" value={shippingForm.data.rate} onChange={(event) => shippingForm.setData('rate', event.target.value)} />
                    <Button type="submit" disabled={shippingForm.processing}>
                        Add method
                    </Button>
                </form>
            </section>
        </AdminLayout>
    );
}

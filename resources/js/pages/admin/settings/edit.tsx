import { BrandingForm } from '@/components/admin/branding-form';
import { FormCard, FormField } from '@/components/admin/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

interface AdminSettingsProps {
    settings: Record<string, unknown>;
    branding: {
        logo_url: string | null;
        favicon_url: string | null;
    };
}

const str = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

export default function AdminSettings({ settings, branding }: AdminSettingsProps) {
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

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.put('/admin/settings');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Settings', href: '/admin/settings' },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs} title="Settings" description="Store details, branding, checkout and SEO.">
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
                <div>
                    <h2 className="text-lg font-medium">Branding</h2>
                    <p className="text-muted-foreground text-sm">Logo and favicon uploads are saved separately from store text settings.</p>
                </div>
                <BrandingForm logoUrl={branding.logo_url} faviconUrl={branding.favicon_url} />
            </section>
        </AdminLayout>
    );
}

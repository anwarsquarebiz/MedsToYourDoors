import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type AddressRecord, type SeoMeta } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

interface AccountAddressesProps {
    addresses: { data: AddressRecord[] } | AddressRecord[];
    seo: SeoMeta;
}

export default function AccountAddresses({ addresses, seo }: AccountAddressesProps) {
    const list = Array.isArray(addresses) ? addresses : addresses.data;
    const form = useForm({
        type: 'shipping',
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
        is_default: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/account/addresses', { onSuccess: () => form.reset() });
    };

    return (
        <StorefrontLayout>
            <Head title={seo.title} />

            <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
                <h1 className="text-3xl font-semibold tracking-tight">Address book</h1>
                <nav className="mt-4 flex gap-4 text-sm">
                    <Link href="/account" className="text-neutral-600 hover:underline dark:text-neutral-400">
                        Profile
                    </Link>
                    <Link href="/account/orders" className="text-neutral-600 hover:underline dark:text-neutral-400">
                        Orders
                    </Link>
                    <Link href="/account/addresses" className="font-medium">
                        Addresses
                    </Link>
                </nav>

                <ul className="mt-8 space-y-3">
                    {list.map((address) => (
                        <li key={address.id} className="flex items-start justify-between rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
                            <p>{address.one_line}</p>
                            <Button variant="ghost" size="sm" onClick={() => router.delete(`/account/addresses/${address.id}`)}>
                                Remove
                            </Button>
                        </li>
                    ))}
                </ul>

                <form onSubmit={submit} className="mt-8 grid gap-4 rounded-xl border border-neutral-200 p-6 sm:grid-cols-2 dark:border-neutral-800">
                    <h2 className="font-medium sm:col-span-2">Add address</h2>
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First name</Label>
                        <Input id="first_name" value={form.data.first_name} onChange={(event) => form.setData('first_name', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Last name</Label>
                        <Input id="last_name" value={form.data.last_name} onChange={(event) => form.setData('last_name', event.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address_line1">Address</Label>
                        <Input id="address_line1" value={form.data.address_line1} onChange={(event) => form.setData('address_line1', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={form.data.city} onChange={(event) => form.setData('city', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal code</Label>
                        <Input id="postal_code" value={form.data.postal_code} onChange={(event) => form.setData('postal_code', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country_code">Country</Label>
                        <Input id="country_code" value={form.data.country_code} onChange={(event) => form.setData('country_code', event.target.value.toUpperCase())} />
                    </div>
                    <div className="sm:col-span-2">
                        <Button type="submit" disabled={form.processing}>
                            Save address
                        </Button>
                    </div>
                </form>
            </div>
        </StorefrontLayout>
    );
}

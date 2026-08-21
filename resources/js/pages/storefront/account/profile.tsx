import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type AddressRecord, type SeoMeta } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

interface AccountProfileProps {
    profile: { name: string; email: string; phone: string | null; accepts_marketing: boolean };
    addresses: { data: AddressRecord[] } | AddressRecord[];
    seo: SeoMeta;
}

export default function AccountProfile({ profile, addresses, seo }: AccountProfileProps) {
    const form = useForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? '',
        accepts_marketing: profile.accepts_marketing,
    });

    const list = Array.isArray(addresses) ? addresses : addresses.data;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.patch('/account');
    };

    return (
        <StorefrontLayout>
            <Head title={seo.title} />

            <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
                <h1 className="text-3xl font-semibold tracking-tight">Your account</h1>
                <nav className="mt-4 flex gap-4 text-sm">
                    <Link href="/account" className="font-medium">
                        Profile
                    </Link>
                    <Link href="/account/orders" className="text-neutral-600 hover:underline dark:text-neutral-400">
                        Orders
                    </Link>
                    <Link href="/account/addresses" className="text-neutral-600 hover:underline dark:text-neutral-400">
                        Addresses
                    </Link>
                </nav>

                <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} />
                    </div>
                    <Button type="submit" disabled={form.processing}>
                        Save
                    </Button>
                </form>

                <div className="mt-8">
                    <h2 className="font-medium">Addresses</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        {list.map((address) => (
                            <li key={address.id}>{address.one_line}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </StorefrontLayout>
    );
}

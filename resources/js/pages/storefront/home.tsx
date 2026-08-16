import StorefrontLayout from '@/layouts/storefront-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldCheck, Truck, Undo2 } from 'lucide-react';

const guarantees = [
    { icon: Truck, title: 'Fast delivery', description: 'Dispatched within one business day.' },
    { icon: ShieldCheck, title: 'Licensed partners', description: 'Sourced only from verified pharmacies.' },
    { icon: Undo2, title: 'Easy returns', description: '30 day return window on eligible items.' },
];

export default function Home() {
    const { store } = usePage<SharedData>().props;

    return (
        <StorefrontLayout>
            <Head title={`${store.name} · Health essentials delivered`} />

            <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
                <div className="max-w-2xl space-y-6">
                    <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">{store.name}</p>
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Health essentials, delivered to your door.</h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-300">
                        Browse trusted medication and everyday care products, with transparent pricing and reliable delivery.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/products"
                            className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                        >
                            Shop all products
                        </Link>
                        <Link
                            href="/pages/about-us"
                            className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        >
                            About us
                        </Link>
                    </div>
                </div>
            </section>

            <section className="border-t border-neutral-200 dark:border-neutral-800">
                <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
                    {guarantees.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="flex gap-4">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                <Icon className="size-5" />
                            </span>
                            <div className="space-y-1">
                                <p className="font-medium">{title}</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </StorefrontLayout>
    );
}

import { HomeBannerSlider } from '@/components/storefront/home-banner-slider';
import { ProductCard } from '@/components/storefront/product-card';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type CollectionSummary, type HomeBanner, type ProductSummary, type SeoMeta, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ImageOff, ShieldCheck, Truck, Undo2 } from 'lucide-react';

const guarantees = [
    { icon: Truck, title: 'Fast delivery', description: 'Dispatched within one business day.' },
    { icon: ShieldCheck, title: 'Licensed partners', description: 'Sourced only from verified pharmacies.' },
    { icon: Undo2, title: 'Easy returns', description: '30 day return window on eligible items.' },
];

interface HomeProps {
    banners: { data: HomeBanner[] };
    newArrivals: { data: ProductSummary[] };
    collections: { data: CollectionSummary[] };
    seo: SeoMeta;
}

export default function Home({ banners, newArrivals, collections, seo }: HomeProps) {
    const { store } = usePage<SharedData>().props;
    const slides = banners.data.filter((banner) => Boolean(banner.image_url));

    return (
        <StorefrontLayout>
            <Head title={seo.title}>{seo.description && <meta name="description" content={seo.description} />}</Head>

            {slides.length > 0 ? (
                <HomeBannerSlider banners={slides} />
            ) : (
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
                                prefetch
                                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
                            >
                                Shop all products
                            </Link>
                            <Link
                                href="/collections"
                                prefetch
                                className="hover:bg-accent rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium transition-colors dark:border-neutral-700"
                            >
                                Browse collections
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {collections.data.length > 0 && (
                <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 mt-10">
                    <h2 className="mb-6 text-2xl font-semibold tracking-tight">Shop by collection</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                        {collections.data.map((collection) => (
                            <Link key={collection.id} href={collection.url} prefetch className="group space-y-2">
                                <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    {collection.image_url ? (
                                        <img
                                            src={collection.image_url}
                                            alt={collection.title}
                                            loading="lazy"
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-neutral-400">
                                            <ImageOff className="size-6" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium group-hover:underline">{collection.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {newArrivals.data.length > 0 && (
                <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
                    <div className="mb-6 flex items-baseline justify-between">
                        <h2 className="text-2xl font-semibold tracking-tight">New arrivals</h2>
                        <Link href="/products" prefetch className="text-primary text-sm font-medium underline-offset-4 hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {newArrivals.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            <section className="border-t border-neutral-200 dark:border-neutral-800">
                <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
                    {guarantees.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="flex gap-4">
                            <span className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
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

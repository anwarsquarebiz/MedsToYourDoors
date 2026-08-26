import { HomeBannerSlider } from '@/components/storefront/home-banner-slider';
import { HomeFormulaSection } from '@/components/storefront/home-formula-section';
import { ProductCard } from '@/components/storefront/product-card';
import { Button } from '@/components/ui/button';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type CollectionSummary, type HomeBanner, type ProductSummary, type SeoMeta, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, ImageOff, Lock, PackageCheck, ShieldCheck } from 'lucide-react';

const categoryTiles = [
    {
        eyebrow: 'Double Impact',
        title: 'Maximum Control. Total Confidence.',
        description: (
            <>
                A powerful dual-action formula built for <em>unmatched satisfaction.</em>
            </>
        ),
        cta: 'Experience the Max',
        href: '/products',
    },
    {
        eyebrow: "Men's Edge",
        title: 'Unleash Your Ultimate Drive.',
        description: (
            <>
                Precision-crafted for those who demand <em>peak physical confidence.</em>
            </>
        ),
        cta: 'Discover the Power',
        href: '/products',
    },
    {
        eyebrow: 'Pure Performance',
        title: 'Upgrade Your Lifestyle Potential.',
        description: (
            <>
                <em>Scientifically</em> advanced support to help you stay ahead every day.
            </>
        ),
        cta: 'Explore More',
        href: '/products',
    },
    {
        eyebrow: 'Moment Control',
        title: 'Take Charge of Your Time.',
        description: (
            <>
                <em>Fast-acting</em>, discrete comfort designed for your private routine.
            </>
        ),
        cta: 'Get the Edge',
        href: '/products',
    },
];

const promises = [
    {
        title: 'Quality First',
        description: 'We focus on clear product information and careful quality standards.',
    },
    {
        title: 'Private by Choice',
        description: 'Your personal choices matter. We value simple and respectful service.',
    },
    {
        title: 'Easy to Choose',
        description: 'Clear details and simple steps to help you choose with confidence.',
    },
    {
        title: 'Delivered Across USA',
        description: 'Easy ordering and delivery support across India.',
    },
];

const advantages = [
    {
        icon: ShieldCheck,
        title: 'Certified Manufacturing',
        description: 'Products backed by GMP & USFDA certified manufacturing standards for better trust and quality confidence.',
    },
    {
        icon: BadgeCheck,
        title: 'Genuine Product Promise',
        description: 'We deliver 100% genuine products with proper packaging, clear details, and careful order handling.',
    },
    {
        icon: Lock,
        title: 'Private Delivery, Always',
        description: 'Every order is packed discreetly and delivered privately, so your purchase stays personal.',
    },
    {
        icon: PackageCheck,
        title: 'Authorized Retailer',
        description: 'We are an authorized retailer for all the brands we carry',
    },
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
    const featuredProducts = newArrivals.data.slice(0, 4);

    return (
        <StorefrontLayout>
            <Head title={seo.title}>{seo.description && <meta name="description" content={seo.description} />}</Head>

            {slides.length > 0 ? (
                <HomeBannerSlider banners={slides} />
            ) : (
                <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
                    <div className="flex max-w-2xl flex-col gap-6">
                        <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">Peak performance. Total confidence.</p>
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Unlock Your True Potential</h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-300">
                            Experience the gold standard in men&apos;s premium care. We bring you elite solutions designed for maximum impact and
                            total satisfaction. It&apos;s time to own every moment with unmatched strength and drive.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/products" prefetch>
                                Experience the Power
                            </Link>
                        </Button>
                    </div>
                </section>
            )}

            <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {categoryTiles.map((tile) => (
                        <article
                            key={tile.eyebrow}
                            className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
                        >
                            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">{tile.eyebrow}</p>
                            <h2 className="text-xl font-semibold tracking-tight">{tile.title}</h2>
                            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{tile.description}</p>
                            <Link
                                href={tile.href}
                                prefetch
                                className="text-primary mt-auto inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
                            >
                                {tile.cta}
                                <ArrowRight className="size-4" />
                            </Link>
                        </article>
                    ))}
                </div>
            </section>

            <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:py-20">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Truly <em>capture the energy</em> you&apos;re in
                    </h2>
                    <p className="text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-300">
                        Our goal is to bring you ultimate satisfaction and peak performance. We don&apos;t just provide solutions—we empower you to
                        take total control and impress in every moment.
                    </p>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">✨ Your secret to unmatched confidence – always ✨</p>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2">
                <article className="bg-primary text-primary-foreground flex flex-col gap-5 rounded-3xl p-8 lg:p-12">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">Peak performance. Total confidence.</p>
                    <h2 className="text-3xl font-semibold tracking-tight">Unlock Your True Potential</h2>
                    <p className="text-sm leading-relaxed text-white/85 sm:text-base">
                        Experience the gold standard in men&apos;s premium care. We bring you elite solutions designed for maximum impact and total
                        satisfaction. It&apos;s time to own every moment with unmatched strength and drive.
                    </p>
                    <Button asChild variant="secondary" className="mt-auto w-fit">
                        <Link href="/products" prefetch>
                            Experience the Power
                        </Link>
                    </Button>
                </article>
                <article className="bg-accent flex flex-col gap-5 rounded-3xl p-8 lg:p-12">
                    <h2 className="text-3xl font-semibold tracking-tight">Own Your Everyday Confidence</h2>
                    <p className="text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
                        Explore a thoughtful range made for personal care, privacy, and convenience. Simple choices for modern life.
                    </p>
                    <Button asChild className="mt-auto w-fit">
                        <Link href="/products" prefetch>
                            Explore Better Night
                        </Link>
                    </Button>
                </article>
            </section>

            <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
                <div className="flex flex-col gap-8">
                    <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">POWERUPRX PROMISE</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {promises.map((promise) => (
                            <article
                                key={promise.title}
                                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
                            >
                                <h3 className="text-lg font-semibold">{promise.title}</h3>
                                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{promise.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <HomeFormulaSection />

            <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
                <div className="flex flex-col gap-8">
                    <h2 className="text-center text-3xl font-semibold tracking-tight">Why {store.name} Works Better For You</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {advantages.map(({ icon: Icon, title, description }) => (
                            <article key={title} className="flex gap-4 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
                                <span className="bg-accent text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                                    <Icon className="size-5" />
                                </span>
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-semibold">{title}</h3>
                                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {collections.data.length > 0 && (
                <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 sm:px-6">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Discover Our <em>Collections</em>
                        </h2>
                        <Link href="/collections" prefetch className="text-primary text-sm font-medium underline-offset-4 hover:underline">
                            View all
                        </Link>
                    </div>
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

            <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
                <div className="bg-accent flex flex-col gap-6 rounded-3xl p-8 md:flex-row md:items-center md:justify-between lg:p-12">
                    <div className="flex max-w-xl flex-col gap-3">
                        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">Special offer</p>
                        <h2 className="text-3xl font-semibold tracking-tight">Set For A Good Time</h2>
                        <p className="text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300">
                            Discover our range of tablet and options. Each product has a different formula, timing, and use —{' '}
                            <strong>compare the details</strong> and choose what suits you.
                        </p>
                    </div>
                    <Button asChild size="lg">
                        <Link href="/products" prefetch>
                            Get 50% off
                        </Link>
                    </Button>
                </div>
            </section>

            {featuredProducts.length > 0 && (
                <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 sm:px-6">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Love Your Night <em>Naturally</em>
                        </h2>
                        <Link href="/products" prefetch className="text-primary text-sm font-medium underline-offset-4 hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}
        </StorefrontLayout>
    );
}

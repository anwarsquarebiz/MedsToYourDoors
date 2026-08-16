import { FlashMessages } from '@/components/flash-messages';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Package, ShoppingBag, User } from 'lucide-react';

interface StorefrontLayoutProps {
    children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
    const { auth, store, navigation, cart } = usePage<SharedData>().props;

    const collections = navigation?.collections ?? [];
    const pages = navigation?.pages ?? [];
    const cartCount = cart?.item_count ?? 0;

    const primaryLinks = [{ title: 'All products', url: '/products' }, ...collections.slice(0, 5), { title: 'Journal', url: '/blogs/news' }];

    return (
        <div className="flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
            <p className="bg-neutral-900 px-4 py-2 text-center text-xs font-medium text-white dark:bg-neutral-800">
                Free shipping on orders over $50 · Licensed pharmacy partners
            </p>

            <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-6">
                            <SheetTitle className="text-left text-base">Menu</SheetTitle>
                            <nav className="mt-6 flex flex-col gap-1">
                                {primaryLinks.map((link) => (
                                    <Link
                                        key={link.url}
                                        href={link.url}
                                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                            <Package className="size-4" />
                        </span>
                        <span className="hidden sm:inline">{store.name}</span>
                    </Link>

                    <nav className="ml-6 hidden items-center gap-1 lg:flex">
                        {primaryLinks.map((link) => (
                            <Link
                                key={link.url}
                                href={link.url}
                                prefetch
                                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                            >
                                {link.title}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild aria-label={auth.user ? 'Your account' : 'Sign in'}>
                            <Link href={auth.user ? '/account' : '/login'}>
                                <User className="size-5" />
                            </Link>
                        </Button>

                        <Button variant="ghost" size="icon" asChild className="relative" aria-label={`Cart, ${cartCount} items`}>
                            <Link href="/cart">
                                <ShoppingBag className="size-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white dark:bg-white dark:text-neutral-900">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6">
                    <FlashMessages />
                </div>
                {children}
            </main>

            <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
                    <div className="space-y-3">
                        <p className="font-semibold">{store.name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Trusted medication and everyday health essentials, delivered to your door.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-semibold">Shop</p>
                        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <li>
                                <Link href="/products" className="hover:text-neutral-900 dark:hover:text-white">
                                    All products
                                </Link>
                            </li>
                            {collections.slice(0, 4).map((collection) => (
                                <li key={collection.url}>
                                    <Link href={collection.url} className="hover:text-neutral-900 dark:hover:text-white">
                                        {collection.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-semibold">Information</p>
                        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {pages.map((page) => (
                                <li key={page.url}>
                                    <Link href={page.url} className="hover:text-neutral-900 dark:hover:text-white">
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-semibold">Support</p>
                        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {store.email && <li>{store.email}</li>}
                            {store.phone && <li>{store.phone}</li>}
                            <li>
                                <Link href={auth.user ? '/account/orders' : '/login'} className="hover:text-neutral-900 dark:hover:text-white">
                                    Order history
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-200 px-4 py-6 text-center text-xs text-neutral-500 sm:px-6 dark:border-neutral-800 dark:text-neutral-400">
                    © {new Date().getFullYear()} {store.name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

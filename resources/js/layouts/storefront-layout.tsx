import { FlashMessages } from '@/components/flash-messages';
import { CartDrawer, useCartDrawer } from '@/components/storefront/cart-drawer';
import { CurrencySwitcher } from '@/components/storefront/currency-switcher';
import { StoreLogo } from '@/components/store-logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type NavLink, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, ShoppingBag, User } from 'lucide-react';

interface StorefrontLayoutProps {
    children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
    const { auth, store, navigation, cart } = usePage<SharedData>().props;
    const { open: cartOpen, setOpen: setCartOpen, openCart } = useCartDrawer();

    const collections = navigation?.collections ?? [];
    const pages = navigation?.pages ?? [];
    const headerLinks = navigation?.header ?? [];
    const cartCount = cart?.item_count ?? 0;

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col">
            <p className="bg-primary text-primary-foreground px-4 py-2 text-center text-xs font-medium">
                Free shipping on orders over {store.free_shipping_threshold.formatted} · Licensed pharmacy partners
            </p>

            <header className="bg-background/90 sticky top-0 z-40 border-b border-neutral-200 backdrop-blur dark:border-neutral-800">
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
                                {headerLinks.map((link, index) => (
                                    <HeaderNavLink key={`${link.url}-${index}`} link={link} className="hover:bg-accent hover:text-primary rounded-md px-3 py-2 text-sm font-medium" />
                                ))}
                            </nav>
                            <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                                <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wide uppercase">Currency</p>
                                <CurrencySwitcher />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                        <span
                            className={`flex size-12 items-center justify-center overflow-hidden rounded-lg ${store.logo_url ? '' : 'bg-primary text-primary-foreground'}`}
                        >
                            <StoreLogo
                                imageClassName="h-full w-full object-contain"
                                fallbackClassName="size-4 fill-current text-primary-foreground"
                            />
                        </span>
                        <span className="hidden sm:inline">{store.name}</span>
                    </Link>

                    <nav className="ml-6 hidden items-center gap-1 lg:flex">
                        {headerLinks.map((link, index) => (
                            <HeaderNavLink
                                key={`${link.url}-${index}`}
                                link={link}
                                prefetch
                                className="hover:bg-accent hover:text-primary rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors dark:text-neutral-300"
                            />
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-1">
                        <CurrencySwitcher compact />

                        <Button variant="ghost" size="icon" asChild aria-label={auth.user ? 'Your account' : 'Sign in'}>
                            <Link href={auth.user ? '/account' : '/login'}>
                                <User className="size-5" />
                            </Link>
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative"
                            aria-label={`Cart, ${cartCount} items`}
                            aria-expanded={cartOpen}
                            onClick={openCart}
                        >
                            <ShoppingBag className="size-5" />
                            {cartCount > 0 && (
                                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                    <FlashMessages />
                </div>
                {children}
            </main>

            <footer className="bg-accent mt-16 border-t border-neutral-200 dark:border-neutral-800">
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
                                <Link href="/products" className="hover:text-primary">
                                    All products
                                </Link>
                            </li>
                            {collections.slice(0, 4).map((collection) => (
                                <li key={collection.url}>
                                    <Link href={collection.url} className="hover:text-primary">
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
                                    <Link href={page.url} className="hover:text-primary">
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
                                <Link href={auth.user ? '/account/orders' : '/login'} className="hover:text-primary">
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

            <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
        </div>
    );
}

function HeaderNavLink({
    link,
    className,
    prefetch = false,
}: {
    link: NavLink;
    className: string;
    prefetch?: boolean;
}) {
    if (link.external) {
        return (
            <a href={link.url} className={className} rel="noopener noreferrer">
                {link.title}
            </a>
        );
    }

    return (
        <Link href={link.url} prefetch={prefetch} className={className}>
            {link.title}
        </Link>
    );
}

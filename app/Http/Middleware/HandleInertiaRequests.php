<?php

namespace App\Http\Middleware;

use App\Http\Resources\CartItemResource;
use App\Services\Cart\CartResolver;
use App\Services\Cart\CartService;
use App\Services\Settings\BrandingService;
use App\Services\Settings\SettingsService;
use App\Services\Storefront\NavigationService;
use App\Support\CartTotals;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    public function __construct(
        private readonly SettingsService $settings,
        private readonly BrandingService $branding,
        private readonly NavigationService $navigation,
        private readonly CartResolver $cartResolver,
        private readonly CartService $carts,
    ) {}

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user === null ? null : [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'is_admin' => $user->isAdmin(),
                    'email_verified_at' => $user->email_verified_at,
                ],
            ],
            'store' => fn (): array => [
                'name' => $this->settings->get('store.name'),
                'email' => $this->settings->get('store.email'),
                'phone' => $this->settings->get('store.phone'),
                'currency' => config('shop.currency.code'),
                'social' => $this->settings->group('social')->all(),
                'logo_url' => $this->branding->logoUrl(),
                'favicon_url' => $this->branding->faviconUrl(),
            ],
            'navigation' => fn (): array => [
                'header' => $this->navigation->header(),
                'collections' => $this->navigation->collections(),
                'pages' => $this->navigation->pages(),
            ],

            /*
             | A lazy closure so the header badge never costs a query on requests
             | that do not render it, and never creates a cart just by browsing.
             */
            'cart' => fn (): array => $this->cartSummary(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'open_cart' => (bool) $request->session()->get('open_cart'),
            ],
        ];
    }

    /**
     * Header badge plus line items for the storefront cart drawer.
     *
     * @return array<string, mixed>
     */
    private function cartSummary(): array
    {
        $cart = $this->cartResolver->current();
        $totals = $cart === null ? CartTotals::empty() : $this->carts->totals($cart);

        return [
            'item_count' => $totals->itemCount,
            'subtotal' => $totals->subtotal->toArray(),
            'discount' => $totals->discount->toArray(),
            'total' => $totals->total()->toArray(),
            'coupon_code' => $totals->couponCode,
            'items' => $cart === null
                ? []
                : CartItemResource::collection($cart->items->sortBy('id')->values())->resolve(),
        ];
    }
}

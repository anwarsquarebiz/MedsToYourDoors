<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ShippingMethodType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateStoreSettingsRequest;
use App\Http\Requests\Admin\Shipping\ShippingMethodFormRequest;
use App\Http\Resources\ShippingMethodResource;
use App\Models\ShippingMethod;
use App\Services\Settings\SettingsService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(private readonly SettingsService $settings) {}

    public function edit(): Response
    {
        abort_unless(request()->user()?->isAdmin(), 403);

        return Inertia::render('admin/settings/edit', [
            'settings' => $this->settings->all(),
            'shipping_methods' => ShippingMethodResource::collection(
                ShippingMethod::query()->orderBy('position')->orderBy('id')->get()
            ),
            'shipping_types' => ShippingMethodType::options(),
        ]);
    }

    public function update(UpdateStoreSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $this->settings->setMany([
            'store.name' => $data['store']['name'],
            'store.email' => $data['store']['email'],
            'store.phone' => $data['store']['phone'] ?? '',
            'store.address' => $data['store']['address'] ?? '',
        ], 'store');

        $this->settings->setMany([
            'checkout.tax_rate_basis_points' => (int) ($data['checkout']['tax_rate_basis_points'] ?? 0),
            'checkout.guest_checkout_enabled' => (bool) ($data['checkout']['guest_checkout_enabled'] ?? true),
        ], 'checkout');

        $this->settings->setMany([
            'seo.default_title' => $data['seo']['default_title'] ?? '',
            'seo.default_description' => $data['seo']['default_description'] ?? '',
        ], 'seo');

        $this->settings->setMany([
            'social.facebook' => $data['social']['facebook'] ?? '',
            'social.instagram' => $data['social']['instagram'] ?? '',
            'social.twitter' => $data['social']['twitter'] ?? '',
        ], 'social');

        return back()->with('success', 'Settings saved.');
    }

    public function storeShippingMethod(ShippingMethodFormRequest $request): RedirectResponse
    {
        ShippingMethod::query()->create($this->shippingAttributes($request->validated()));

        return back()->with('success', 'Shipping method added.');
    }

    public function updateShippingMethod(ShippingMethodFormRequest $request, ShippingMethod $method): RedirectResponse
    {
        $method->update($this->shippingAttributes($request->validated()));

        return back()->with('success', 'Shipping method saved.');
    }

    public function destroyShippingMethod(ShippingMethod $method): RedirectResponse
    {
        abort_unless(request()->user()?->isAdmin(), 403);

        $method->delete();

        return back()->with('success', 'Shipping method removed.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function shippingAttributes(array $data): array
    {
        return [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'rate_amount' => Money::fromDecimal($data['rate']),
            'free_over_amount' => ($data['free_over'] ?? null) === null || $data['free_over'] === ''
                ? null
                : Money::fromDecimal($data['free_over']),
            'is_active' => $data['is_active'] ?? true,
            'position' => $data['position'] ?? 0,
        ];
    }
}

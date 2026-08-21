<?php

namespace App\Http\Resources;

use App\Models\Cart;
use App\Support\CartTotals;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The full cart for the /cart page. Totals are passed in rather than recomputed
 * here so the page and the shared header badge always agree.
 *
 * @mixin Cart
 */
class CartResource extends JsonResource
{
    public function __construct(Cart $cart, private readonly CartTotals $totals)
    {
        parent::__construct($cart);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'currency' => $this->currency,
            'items' => CartItemResource::collection(
                $this->items->sortBy('id')->values()
            ),
            'totals' => $this->totals->toArray(),
            'coupon' => $this->coupon === null ? null : [
                'code' => $this->coupon->code,
                'description' => $this->coupon->description,
                'value' => $this->coupon->displayValue(),
                'applied' => $this->totals->hasDiscount(),
            ],
        ];
    }
}

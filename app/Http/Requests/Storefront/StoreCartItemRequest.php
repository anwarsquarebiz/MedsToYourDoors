<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class StoreCartItemRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:'.config('shop.cart.max_quantity_per_line', 99)],
        ];
    }

    public function quantity(): int
    {
        return max(1, (int) ($this->validated('quantity') ?? 1));
    }

    public function variantId(): int
    {
        return (int) $this->validated('product_variant_id');
    }
}

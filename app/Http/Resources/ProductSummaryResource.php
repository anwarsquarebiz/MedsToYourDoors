<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product as shown in a grid. Expects the `variants` and `images` relations to
 * be loaded; `min_price_amount` is provided by the repository's withMin().
 *
 * @mixin Product
 */
class ProductSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $firstImage = $this->images->first();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'vendor' => $this->vendor,
            'product_type' => $this->product_type,
            'url' => route('products.show', $this->slug),
            'price_from' => $this->priceFrom(),
            'compare_at_price' => $this->highestCompareAtPrice(),
            'on_sale' => $this->variants->contains(fn ($variant): bool => $variant->isOnSale()),
            'in_stock' => $this->isInStock(),
            'variant_count' => $this->variants->count(),
            'image' => $firstImage === null ? null : [
                'url' => $firstImage->url(),
                'alt' => $firstImage->alt ?? $this->title,
            ],
        ];
    }

    /**
     * The lowest variant price, preferring the aggregate the repository selected
     * so a grid does not need every variant hydrated to show "from" pricing.
     */
    private function priceFrom(): Money
    {
        if ($this->min_price_amount !== null) {
            return Money::fromMinor((int) $this->min_price_amount);
        }

        $lowest = $this->variants->min(fn ($variant): int => $variant->price()->amount);

        return Money::fromMinor((int) ($lowest ?? 0));
    }

    private function highestCompareAtPrice(): ?Money
    {
        $highest = $this->variants
            ->filter(fn ($variant): bool => $variant->isOnSale())
            ->max(fn ($variant): int => $variant->compare_at_price_amount->amount);

        return $highest === null ? null : Money::fromMinor((int) $highest);
    }
}

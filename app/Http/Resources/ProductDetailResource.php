<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Models\ProductOption;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The full product, as rendered on /products/{slug} and in the admin editor.
 *
 * @mixin Product
 */
class ProductDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'body_html' => $this->body_html,
            'status' => $this->status->value,
            'vendor' => $this->vendor,
            'product_type' => $this->product_type,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'meta_title' => $this->metaTitle(),
            'meta_description' => $this->metaDescription(),
            'published_at' => $this->published_at?->toDateTimeString(),
            'is_published' => $this->isPublished(),
            'in_stock' => $this->isInStock(),
            'url' => route('products.show', $this->slug),
            'variants' => ProductVariantResource::collection($this->variants),
            'images' => ProductImageResource::collection($this->images),
            'options' => $this->options->map(fn (ProductOption $option): array => [
                'id' => $option->id,
                'name' => $option->name,
                'position' => $option->position,
                'values' => $option->values ?? [],
            ])->values(),
            'collections' => $this->whenLoaded(
                'collections',
                fn () => CollectionSummaryResource::collection($this->collections),
            ),
        ];
    }
}

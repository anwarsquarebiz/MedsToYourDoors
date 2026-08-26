<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\ProductIndexRequest;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductSummaryResource;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(private readonly ProductRepositoryInterface $products) {}

    public function index(ProductIndexRequest $request): Response
    {
        return Inertia::render('storefront/products/index', [
            'products' => ProductSummaryResource::collection(
                $this->products->paginatePublished($request->catalogFilters())
            ),
            'filters' => $request->filters(),
            'seo' => [
                'title' => 'All products',
                'description' => 'Browse every product available in our store.',
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $product = $this->products->findPublishedBySlug($slug);

        abort_if($product === null, 404);

        return Inertia::render('storefront/products/show', [
            'product' => new ProductDetailResource($product),
            'seo' => [
                'title' => $product->metaTitle(),
                'description' => $product->metaDescription(),
            ],
        ]);
    }
}

<?php

use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;

it('renders the home page', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('storefront/home'));
});

it('lists published products', function () {
    $product = Product::factory()->create(['title' => 'Visible Product']);
    ProductVariant::factory()->for($product)->create();

    $this->get('/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/products/index')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Visible Product')
        );
});

it('hides drafts, archived and scheduled products from the listing', function () {
    ProductVariant::factory()->for(Product::factory()->draft())->create();
    ProductVariant::factory()->for(Product::factory()->archived())->create();
    ProductVariant::factory()->for(Product::factory()->scheduled())->create();

    $this->get('/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('products.data', 0));
});

it('shows a published product', function () {
    $product = Product::factory()->create(['slug' => 'vitamin-c']);
    ProductVariant::factory()->for($product)->priced(1250)->create();

    $this->get('/products/vitamin-c')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/products/show')
            ->where('product.data.slug', 'vitamin-c')
            ->where('product.data.variants.0.price.formatted', '$12.50')
        );
});

it('returns 404 for a draft product', function () {
    $product = Product::factory()->draft()->create(['slug' => 'secret']);
    ProductVariant::factory()->for($product)->create();

    $this->get('/products/secret')->assertNotFound();
});

it('returns 404 for an unknown product slug', function () {
    $this->get('/products/does-not-exist')->assertNotFound();
});

it('searches products by title', function () {
    ProductVariant::factory()->for(Product::factory()->create(['title' => 'Ibuprofen Gel']))->create();
    ProductVariant::factory()->for(Product::factory()->create(['title' => 'Vitamin D Drops']))->create();

    $this->get('/products?search=Ibuprofen')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Ibuprofen Gel')
        );
});

it('sorts products by price ascending', function () {
    ProductVariant::factory()->for(Product::factory()->create(['title' => 'Expensive']))->priced(5000)->create();
    ProductVariant::factory()->for(Product::factory()->create(['title' => 'Cheap']))->priced(500)->create();

    $this->get('/products?sort=price_asc')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('products.data.0.title', 'Cheap'));
});

it('filters to products that are in stock', function () {
    ProductVariant::factory()->for(Product::factory()->create(['title' => 'Available']))->withStock(5)->create();
    ProductVariant::factory()->for(Product::factory()->create(['title' => 'Sold out']))->outOfStock()->create();

    $this->get('/products?in_stock=1')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Available')
        );
});

it('rejects an unknown sort value', function () {
    $this->get('/products?sort=bogus')->assertSessionHasErrors('sort');
});

it('lists published collections', function () {
    Collection::factory()->create(['title' => 'Cold and Flu']);
    Collection::factory()->draft()->create(['title' => 'Hidden']);

    $this->get('/collections')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/collections/index')
            ->has('collections.data', 1)
            ->where('collections.data.0.title', 'Cold and Flu')
        );
});

it('shows only published products inside a collection', function () {
    $collection = Collection::factory()->create(['slug' => 'daily-care']);

    $live = Product::factory()->create(['title' => 'Live']);
    ProductVariant::factory()->for($live)->create();

    $draft = Product::factory()->draft()->create(['title' => 'Draft']);
    ProductVariant::factory()->for($draft)->create();

    $collection->products()->attach([$live->id, $draft->id]);

    $this->get('/collections/daily-care')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/collections/show')
            ->where('collection.data.slug', 'daily-care')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Live')
        );
});

it('returns 404 for a draft collection', function () {
    Collection::factory()->draft()->create(['slug' => 'unpublished']);

    $this->get('/collections/unpublished')->assertNotFound();
});

it('shows a "from" price when a product has several variants', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->for($product)->priced(2000)->create();
    ProductVariant::factory()->for($product)->priced(800)->create();

    $this->get('/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.data.0.price_from.formatted', '$8.00')
            ->where('products.data.0.variant_count', 2)
        );
});

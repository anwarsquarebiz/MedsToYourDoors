<?php

use App\Enums\ProductStatus;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

/**
 * @return array<string, mixed>
 */
function adminProductPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Cough Syrup',
        'slug' => '',
        'description' => 'Soothing relief',
        'body_html' => '',
        'status' => ProductStatus::Active->value,
        'vendor' => 'Acme Pharma',
        'product_type' => 'Syrup',
        'seo_title' => '',
        'seo_description' => '',
        'collection_ids' => [],
        'options' => [],
        'variants' => [
            [
                'id' => null,
                'title' => '200ml',
                'sku' => 'SYRUP-200',
                'price' => '7.50',
                'inventory_quantity' => 30,
                'track_inventory' => true,
                'inventory_policy' => 'deny',
            ],
        ],
    ], $overrides);
}

it('lists products for staff', function () {
    Product::factory()->count(3)->create()->each(
        fn (Product $product) => ProductVariant::factory()->for($product)->create()
    );

    $this->actingAs($this->admin)
        ->get('/admin/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/products/index')
            ->has('products.data', 3)
            ->has('products.meta')
            ->has('products.meta.links')
        );
});

it('includes image urls and paginates the admin listing', function () {
    config(['shop.catalog.admin_per_page' => 2]);

    Product::factory()->count(2)->create()->each(
        fn (Product $row) => ProductVariant::factory()->for($row)->create()
    );

    $product = Product::factory()->create([
        'title' => 'With photo',
        'created_at' => now()->addMinute(),
    ]);
    ProductVariant::factory()->for($product)->create();
    $image = $product->images()->create([
        'disk' => 'public',
        'path' => 'products/example.jpg',
        'alt' => 'With photo',
        'position' => 1,
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 2)
            ->where('products.meta.per_page', 2)
            ->where('products.meta.total', 3)
            ->has('products.meta.links')
            ->where('products.data.0.title', 'With photo')
            ->where('products.data.0.images.0.url', $image->url())
        );
});

it('includes drafts in the admin listing', function () {
    ProductVariant::factory()->for(Product::factory()->draft())->create();

    $this->actingAs($this->admin)
        ->get('/admin/products')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('products.data', 1));
});

it('creates a product and redirects to the editor', function () {
    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload())
        ->assertRedirect()
        ->assertSessionHas('success');

    $product = Product::query()->firstOrFail();

    expect($product->title)->toBe('Cough Syrup')
        ->and($product->slug)->toBe('cough-syrup')
        ->and($product->variants()->count())->toBe(1)
        ->and($product->variants()->first()->price_amount->amount)->toBe(750);
});

it('publishes an active product immediately', function () {
    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload(['published_at' => null]));

    expect(Product::query()->firstOrFail()->isPublished())->toBeTrue();
});

it('leaves a draft unpublished', function () {
    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload(['status' => ProductStatus::Draft->value]));

    $product = Product::query()->firstOrFail();

    expect($product->published_at)->toBeNull()
        ->and($product->isPublished())->toBeFalse();
});

it('requires a title', function () {
    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload(['title' => '']))
        ->assertSessionHasErrors('title');
});

it('requires at least one variant', function () {
    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload(['variants' => []]))
        ->assertSessionHasErrors('variants');
});

it('rejects a duplicate sku across products', function () {
    ProductVariant::factory()->create(['sku' => 'TAKEN-1']);

    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload([
            'variants' => [
                ['id' => null, 'title' => 'A', 'sku' => 'TAKEN-1', 'price' => '1.00', 'inventory_quantity' => 1, 'inventory_policy' => 'deny'],
            ],
        ]))
        ->assertSessionHasErrors('variants.0.sku');
});

it('rejects a sku repeated within the same submission', function () {
    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload([
            'variants' => [
                ['id' => null, 'title' => 'A', 'sku' => 'DUPE', 'price' => '1.00', 'inventory_quantity' => 1, 'inventory_policy' => 'deny'],
                ['id' => null, 'title' => 'B', 'sku' => 'DUPE', 'price' => '2.00', 'inventory_quantity' => 1, 'inventory_policy' => 'deny'],
            ],
        ]))
        ->assertSessionHasErrors('variants.1.sku');
});

it('rejects a negative price', function () {
    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload([
            'variants' => [
                ['id' => null, 'title' => 'A', 'price' => '-5.00', 'inventory_quantity' => 1, 'inventory_policy' => 'deny'],
            ],
        ]))
        ->assertSessionHasErrors('variants.0.price');
});

it('opens the edit screen', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->for($product)->create();

    $this->actingAs($this->admin)
        ->get("/admin/products/{$product->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/products/edit')
            ->where('product.data.id', $product->id)
        );
});

it('updates a product', function () {
    $product = Product::factory()->create(['title' => 'Old title']);
    $variant = ProductVariant::factory()->for($product)->create();

    $this->actingAs($this->admin)
        ->from("/admin/products/{$product->id}/edit")
        ->put("/admin/products/{$product->id}", adminProductPayload([
            'title' => 'New title',
            'variants' => [
                ['id' => $variant->id, 'title' => 'Updated', 'price' => '9.99', 'inventory_quantity' => 12, 'inventory_policy' => 'deny'],
            ],
        ]))
        ->assertRedirect("/admin/products/{$product->id}/edit")
        ->assertSessionHas('success');

    expect($product->refresh()->title)->toBe('New title')
        ->and($variant->refresh()->price_amount->amount)->toBe(999)
        ->and($variant->inventory_quantity)->toBe(12);
});

it('refuses a variant id belonging to another product', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->for($product)->create();
    $foreign = ProductVariant::factory()->create();

    $this->actingAs($this->admin)
        ->put("/admin/products/{$product->id}", adminProductPayload([
            'variants' => [
                ['id' => $foreign->id, 'title' => 'Hijack', 'price' => '1.00', 'inventory_quantity' => 1, 'inventory_policy' => 'deny'],
            ],
        ]))
        ->assertSessionHasErrors('variants.0.id');
});

it('syncs collections from the form', function () {
    $collection = Collection::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/products', adminProductPayload(['collection_ids' => [$collection->id]]));

    expect(Product::query()->firstOrFail()->collections()->count())->toBe(1);
});

it('deletes a product', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->for($product)->create();

    $this->actingAs($this->admin)
        ->delete("/admin/products/{$product->id}")
        ->assertRedirect('/admin/products')
        ->assertSessionHas('success');

    expect(Product::query()->count())->toBe(0);
});

it('forbids a customer from every product action', function () {
    $product = Product::factory()->create();
    ProductVariant::factory()->for($product)->create();
    $customer = User::factory()->customer()->create();

    $this->actingAs($customer)->get('/admin/products')->assertForbidden();
    $this->actingAs($customer)->get('/admin/products/create')->assertForbidden();
    $this->actingAs($customer)->post('/admin/products', adminProductPayload())->assertForbidden();
    $this->actingAs($customer)->get("/admin/products/{$product->id}/edit")->assertForbidden();
    $this->actingAs($customer)->delete("/admin/products/{$product->id}")->assertForbidden();
});

it('redirects guests to login', function () {
    $this->get('/admin/products')->assertRedirect('/login');
});

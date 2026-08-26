<?php

namespace Database\Seeders;

use App\Enums\CouponType;
use App\Enums\NavigationLinkType;
use App\Enums\PageTemplate;
use App\Enums\ProductStatus;
use App\Enums\PublishStatus;
use App\Enums\ShippingMethodType;
use App\Enums\UserRole;
use App\Models\Blog;
use App\Models\BlogPost;
use App\Models\Collection;
use App\Models\Coupon;
use App\Models\NavigationItem;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Services\Settings\SettingsService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Store Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Jane Customer',
                'password' => Hash::make('password'),
                'role' => UserRole::Customer,
                'email_verified_at' => now(),
            ],
        );

        app(SettingsService::class)->setMany([
            'store.name' => 'Meds To Your Doors',
            'store.email' => 'support@medstoyourdoors.com',
            'store.phone' => '1-800-555-0100',
        ], 'store');

        $this->pages();
        $this->shipping();
        $this->catalog();
        $this->blog($admin);
        $this->coupons();
        $this->navigation();
    }

    private function pages(): void
    {
        $pages = [
            ['About Us', 'about-us', 'Who we are and how we deliver medication to your door.'],
            ['Contact Us', 'contact-us', 'Reach our support team by email or phone.'],
            ['Privacy Policy', 'privacy-policy', 'How we collect and use your information.'],
            ['Refund Policy', 'refund-policy', 'When and how we issue refunds.'],
            ['Shipping Policy', 'shipping-policy', 'Delivery times, carriers and restrictions.'],
        ];

        foreach ($pages as [$title, $slug, $excerpt]) {
            Page::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'excerpt' => $excerpt,
                    'content' => '<p>'.$excerpt.'</p><p>This policy page can be edited from the admin panel.</p>',
                    'status' => PublishStatus::Published,
                    'template' => $slug === 'contact-us' ? PageTemplate::Contact : PageTemplate::Default,
                    'published_at' => now()->subDay(),
                ],
            );
        }
    }

    private function shipping(): void
    {
        ShippingMethod::query()->updateOrCreate(
            ['name' => 'Standard shipping'],
            [
                'description' => '3–5 business days',
                'type' => ShippingMethodType::FlatRate,
                'rate_amount' => 599,
                'is_active' => true,
                'position' => 1,
            ],
        );

        ShippingMethod::query()->updateOrCreate(
            ['name' => 'Free over $50'],
            [
                'description' => 'Free on orders of $50 or more',
                'type' => ShippingMethodType::FreeOverThreshold,
                'rate_amount' => 799,
                'free_over_amount' => 5000,
                'is_active' => true,
                'position' => 2,
            ],
        );
    }

    private function catalog(): void
    {
        $painRelief = Collection::query()->updateOrCreate(
            ['slug' => 'pain-relief'],
            [
                'title' => 'Pain relief',
                'description' => 'Everyday analgesics and topical relief.',
                'status' => PublishStatus::Published,
                'published_at' => now()->subDay(),
                'position' => 1,
            ],
        );

        $wellness = Collection::query()->updateOrCreate(
            ['slug' => 'wellness'],
            [
                'title' => 'Wellness',
                'description' => 'Vitamins and daily essentials.',
                'status' => PublishStatus::Published,
                'published_at' => now()->subDay(),
                'position' => 2,
            ],
        );

        $products = [
            ['Ibuprofen 200mg', 'ibuprofen-200mg', 'Pain relief tablets', 899, 80, $painRelief],
            ['Paracetamol 500mg', 'paracetamol-500mg', 'Fever and pain relief', 499, 120, $painRelief],
            ['Vitamin D3', 'vitamin-d3', 'Daily vitamin D capsules', 1299, 60, $wellness],
            ['Omega-3', 'omega-3', 'Fish oil softgels', 1599, 40, $wellness],
        ];

        foreach ($products as [$title, $slug, $description, $price, $stock, $collection]) {
            $product = Product::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'description' => $description,
                    'status' => ProductStatus::Active,
                    'published_at' => now()->subDay(),
                    'vendor' => 'Meds To Your Doors',
                ],
            );

            ProductVariant::query()->updateOrCreate(
                ['sku' => strtoupper($slug)],
                [
                    'product_id' => $product->id,
                    'title' => 'Default',
                    'price_amount' => $price,
                    'inventory_quantity' => $stock,
                    'track_inventory' => true,
                    'position' => 1,
                ],
            );

            $product->collections()->syncWithoutDetaching([$collection->id => ['position' => 1]]);
        }
    }

    private function blog(User $author): void
    {
        $blog = Blog::query()->updateOrCreate(
            ['slug' => 'news'],
            [
                'title' => 'News',
                'description' => 'Health tips and store updates.',
            ],
        );

        BlogPost::query()->updateOrCreate(
            ['blog_id' => $blog->id, 'slug' => 'welcome'],
            [
                'user_id' => $author->id,
                'title' => 'Welcome to Meds To Your Doors',
                'excerpt' => 'Licensed pharmacy partners, delivered to your door.',
                'content' => '<p>We are open and taking orders.</p>',
                'status' => PublishStatus::Published,
                'published_at' => now()->subDay(),
            ],
        );
    }

    private function coupons(): void
    {
        Coupon::query()->updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'description' => '$10 off your first order',
                'type' => CouponType::FixedAmount,
                'value' => 1000,
                'is_active' => true,
            ],
        );
    }

    private function navigation(): void
    {
        if (NavigationItem::query()->exists()) {
            return;
        }

        NavigationItem::query()->create([
            'menu' => NavigationItem::MenuHeader,
            'title' => 'All products',
            'type' => NavigationLinkType::Catalog,
            'position' => 1,
        ]);

        $position = 2;

        Collection::query()
            ->published()
            ->orderBy('position')
            ->orderBy('title')
            ->limit(5)
            ->get()
            ->each(function (Collection $collection) use (&$position): void {
                NavigationItem::query()->create([
                    'menu' => NavigationItem::MenuHeader,
                    'title' => $collection->title,
                    'type' => NavigationLinkType::Collection,
                    'resource_id' => $collection->id,
                    'position' => $position,
                ]);
                $position++;
            });

        $blog = Blog::query()->orderBy('id')->first();

        NavigationItem::query()->create([
            'menu' => NavigationItem::MenuHeader,
            'title' => 'Journal',
            'type' => $blog === null ? NavigationLinkType::Url : NavigationLinkType::Blog,
            'resource_id' => $blog?->id,
            'url' => $blog === null ? '/blogs/news' : null,
            'position' => $position,
        ]);
    }
}

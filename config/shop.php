<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | All monetary values are persisted as integers in minor units (for example
    | cents). "decimals" controls how many minor units make up one major unit
    | and is used by App\Support\Money when converting to and from decimals.
    |
    */

    'currency' => [
        'code' => env('SHOP_CURRENCY', 'USD'),
        'decimals' => 2,
        'symbols' => [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'INR' => '₹',
            'AUD' => 'A$',
            'CAD' => 'C$',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cart
    |--------------------------------------------------------------------------
    |
    | Guest carts are tracked with a signed cookie holding an opaque token. The
    | cart is claimed by the customer when they authenticate.
    |
    */

    'cart' => [
        'cookie' => 'cart_token',
        'lifetime_days' => 30,
        'max_quantity_per_line' => 99,
    ],

    /*
    |--------------------------------------------------------------------------
    | Orders
    |--------------------------------------------------------------------------
    */

    'orders' => [
        'number_prefix' => env('SHOP_ORDER_PREFIX', '#'),
        'number_start' => 1001,
    ],

    /*
    |--------------------------------------------------------------------------
    | Inventory
    |--------------------------------------------------------------------------
    */

    'inventory' => [
        'low_stock_threshold' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | Catalog
    |--------------------------------------------------------------------------
    */

    'catalog' => [
        'products_per_page' => 12,
        'admin_per_page' => 20,
        'max_options_per_product' => 3,
        'image_disk' => env('SHOP_IMAGE_DISK', 'public'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache
    |--------------------------------------------------------------------------
    |
    | Storefront reads are cached for this many seconds. The configured cache
    | store may not support tagging, so invalidation uses versioned keys via
    | App\Support\CacheKeys rather than tags.
    |
    */

    'cache' => [
        'ttl' => env('SHOP_CACHE_TTL', 900),
        'enabled' => env('SHOP_CACHE_ENABLED', true),
    ],

];

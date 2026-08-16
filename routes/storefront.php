<?php

use App\Http\Controllers\Storefront\CollectionController;
use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\Storefront\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Routes
|--------------------------------------------------------------------------
|
| Customer-facing routes using Shopify-style URLs. Slugs are resolved inside
| the controllers rather than by route model binding, so unpublished records
| return 404 instead of leaking a draft.
|
*/

Route::get('/', HomeController::class)->name('home');

Route::get('products', [ProductController::class, 'index'])->name('products.index');
Route::get('products/{slug}', [ProductController::class, 'show'])->name('products.show');

Route::get('collections', [CollectionController::class, 'index'])->name('collections.index');
Route::get('collections/{slug}', [CollectionController::class, 'show'])->name('collections.show');

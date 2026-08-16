<?php

use App\Http\Controllers\Storefront\HomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Routes
|--------------------------------------------------------------------------
|
| Customer-facing routes using Shopify-style URLs.
|
*/

Route::get('/', HomeController::class)->name('home');

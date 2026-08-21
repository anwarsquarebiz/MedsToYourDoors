<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug): Response
    {
        $page = Page::query()->published()->where('slug', $slug)->firstOrFail();

        return Inertia::render('storefront/pages/show', [
            'page' => new PageResource($page),
            'seo' => [
                'title' => $page->metaTitle(),
                'description' => $page->metaDescription(),
            ],
        ]);
    }
}

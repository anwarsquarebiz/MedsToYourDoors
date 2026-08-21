<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogPostResource;
use App\Http\Resources\BlogResource;
use App\Models\Blog;
use App\Models\BlogPost;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function show(string $blogSlug): Response
    {
        $blog = Blog::query()->where('slug', $blogSlug)->firstOrFail();

        $posts = BlogPost::query()
            ->with(['blog', 'category', 'author'])
            ->where('blog_id', $blog->getKey())
            ->published()
            ->latest('published_at')
            ->paginate((int) config('shop.catalog.products_per_page', 12))
            ->withQueryString();

        return Inertia::render('storefront/blogs/show', [
            'blog' => new BlogResource($blog),
            'posts' => BlogPostResource::collection($posts),
            'seo' => [
                'title' => $blog->metaTitle(),
                'description' => $blog->metaDescription(),
            ],
        ]);
    }

    public function post(string $blogSlug, string $postSlug): Response
    {
        $blog = Blog::query()->where('slug', $blogSlug)->firstOrFail();

        $post = BlogPost::query()
            ->with(['blog', 'category', 'author'])
            ->where('blog_id', $blog->getKey())
            ->where('slug', $postSlug)
            ->published()
            ->firstOrFail();

        return Inertia::render('storefront/blogs/post', [
            'post' => new BlogPostResource($post),
            'seo' => [
                'title' => $post->metaTitle(),
                'description' => $post->metaDescription(),
            ],
        ]);
    }
}

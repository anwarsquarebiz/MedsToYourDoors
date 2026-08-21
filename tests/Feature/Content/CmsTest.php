<?php

use App\Models\Blog;
use App\Models\BlogPost;
use App\Models\Page;
use App\Models\User;

it('shows a published page and hides drafts', function () {
    $page = Page::factory()->create(['slug' => 'about-us']);
    Page::factory()->draft()->create(['slug' => 'secret']);

    $this->get('/pages/about-us')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('storefront/pages/show')->where('page.data.slug', 'about-us'));

    $this->get('/pages/secret')->assertNotFound();
});

it('shows a published blog post at the shopify-style url', function () {
    $blog = Blog::factory()->create(['slug' => 'news']);
    BlogPost::factory()->for($blog)->create(['slug' => 'welcome']);

    $this->get('/blogs/news/welcome')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('storefront/blogs/post'));

    $this->get('/blogs/news/missing')->assertNotFound();
});

it('lets staff create a page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post('/admin/pages', [
            'title' => 'About Us',
            'slug' => 'about-us',
            'content' => '<p>Hello</p>',
            'status' => 'published',
        ])
        ->assertRedirect();

    expect(Page::query()->where('slug', 'about-us')->exists())->toBeTrue();
});

it('forbids customers from managing pages', function () {
    $this->actingAs(User::factory()->customer()->create())
        ->get('/admin/pages')
        ->assertForbidden();
});

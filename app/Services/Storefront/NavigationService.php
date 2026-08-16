<?php

namespace App\Services\Storefront;

use App\Models\Collection;
use App\Support\CacheKeys;

/**
 * Builds the storefront header and footer navigation.
 *
 * Shared on every request, so the lists are cached and invalidated by the
 * catalog and CMS services bumping their cache domains.
 */
class NavigationService
{
    /**
     * Published collections, for the header and footer.
     *
     * @return array<int, array{title: string, url: string}>
     */
    public function collections(int $limit = 8): array
    {
        /** @var array<int, array{title: string, url: string}> */
        return CacheKeys::remember(CacheKeys::Collections, "navigation:{$limit}", function () use ($limit): array {
            return Collection::query()
                ->published()
                ->orderBy('position')
                ->orderBy('title')
                ->limit($limit)
                ->get(['title', 'slug'])
                ->map(fn (Collection $collection): array => [
                    'title' => $collection->title,
                    'url' => route('collections.show', $collection->slug),
                ])
                ->all();
        });
    }
}

<?php

namespace App\Services\Settings;

use App\Models\Setting;
use App\Support\CacheKeys;
use Illuminate\Support\Collection;

/**
 * Read and write store settings.
 *
 * Values are wrapped in an array on the way into the JSON column so scalars,
 * lists and maps can all round-trip through the same schema. The whole table is
 * cached as one entry because it is small and read on nearly every request.
 */
class SettingsService
{
    /**
     * Store-wide defaults, used when a key has never been written.
     *
     * @var array<string, mixed>
     */
    public const Defaults = [
        'store.name' => 'Meds To Your Doors',
        'store.email' => 'support@medstoyourdoors.com',
        'store.phone' => '',
        'store.address' => '',
        'store.currency' => 'USD',
        'checkout.tax_rate_basis_points' => 0,
        'checkout.guest_checkout_enabled' => true,
        'checkout.terms_required' => true,
        'social.facebook' => '',
        'social.instagram' => '',
        'social.twitter' => '',
        'seo.default_title' => 'Meds To Your Doors',
        'seo.default_description' => 'Trusted medication delivered to your door.',
    ];

    public function get(string $key, mixed $default = null): mixed
    {
        $all = $this->all();

        if ($all->has($key)) {
            return $all->get($key);
        }

        return $default ?? self::Defaults[$key] ?? null;
    }

    public function set(string $key, mixed $value, string $group = 'general'): void
    {
        Setting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => ['data' => $value], 'group' => $group],
        );

        $this->flush();
    }

    /**
     * Persist many settings at once, flushing the cache only after all writes.
     *
     * @param  array<string, mixed>  $values
     */
    public function setMany(array $values, string $group = 'general'): void
    {
        foreach ($values as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => ['data' => $value], 'group' => $group],
            );
        }

        $this->flush();
    }

    /**
     * Every stored setting merged over the defaults.
     *
     * @return Collection<string, mixed>
     */
    public function all(): Collection
    {
        /** @var array<string, mixed> $stored */
        $stored = CacheKeys::remember(CacheKeys::Settings, 'all', function (): array {
            return Setting::query()
                ->get(['key', 'value'])
                ->mapWithKeys(fn (Setting $setting): array => [
                    $setting->key => $setting->value['data'] ?? null,
                ])
                ->all();
        });

        return collect(self::Defaults)->merge($stored);
    }

    /**
     * @return Collection<string, mixed>
     */
    public function group(string $prefix): Collection
    {
        return $this->all()->filter(
            fn (mixed $value, string $key): bool => str_starts_with($key, $prefix.'.')
        );
    }

    public function flush(): void
    {
        CacheKeys::bump(CacheKeys::Settings);
    }
}

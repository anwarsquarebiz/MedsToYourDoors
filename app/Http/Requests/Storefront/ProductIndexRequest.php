<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class ProductIndexRequest extends FormRequest
{
    /**
     * The catalog is public.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', 'in:newest,oldest,price_asc,price_desc,title_asc,title_desc'],
            'in_stock' => ['nullable', 'boolean'],
            'min_price' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
        ];
    }

    /**
     * The filters, normalised for the repository.
     *
     * @return array{search: string|null, sort: string, in_stock: bool, min_price: string|null, max_price: string|null}
     */
    public function filters(): array
    {
        return [
            'search' => $this->string('search')->trim()->value() ?: null,
            'sort' => $this->input('sort', 'newest'),
            'in_stock' => $this->boolean('in_stock'),
            'min_price' => $this->filled('min_price') ? (string) $this->input('min_price') : null,
            'max_price' => $this->filled('max_price') ? (string) $this->input('max_price') : null,
        ];
    }
}

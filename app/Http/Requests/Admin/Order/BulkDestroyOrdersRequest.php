<?php

namespace App\Http\Requests\Admin\Order;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;

class BulkDestroyOrdersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('deleteAny', Order::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct', 'exists:orders,id'],
        ];
    }
}

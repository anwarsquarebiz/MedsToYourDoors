<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('deletes a single order with its items and payments', function () {
    $order = Order::factory()->paid()->create();
    OrderItem::factory()->for($order)->create();
    Payment::factory()->for($order)->paid()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/orders/{$order->id}")
        ->assertRedirect('/admin/orders')
        ->assertSessionHas('success');

    expect(Order::query()->count())->toBe(0)
        ->and(OrderItem::query()->count())->toBe(0)
        ->and(Payment::query()->count())->toBe(0);
});

it('deletes selected orders in bulk', function () {
    [$first, $second, $kept] = Order::factory()->count(3)->create()->all();

    $this->actingAs($this->admin)
        ->from('/admin/orders')
        ->delete('/admin/orders', ['ids' => [$first->id, $second->id]])
        ->assertRedirect('/admin/orders')
        ->assertSessionHas('success', '2 orders were deleted.');

    expect(Order::query()->pluck('id')->all())->toBe([$kept->id]);
});

it('validates the bulk delete payload', function () {
    $this->actingAs($this->admin)
        ->delete('/admin/orders', ['ids' => []])
        ->assertSessionHasErrors('ids');

    $this->actingAs($this->admin)
        ->delete('/admin/orders', ['ids' => [999999]])
        ->assertSessionHasErrors('ids.0');
});

it('forbids a customer from deleting orders', function () {
    $order = Order::factory()->create();
    $customer = User::factory()->customer()->create();

    $this->actingAs($customer)->delete("/admin/orders/{$order->id}")->assertForbidden();
    $this->actingAs($customer)->delete('/admin/orders', ['ids' => [$order->id]])->assertForbidden();

    expect(Order::query()->count())->toBe(1);
});

it('redirects guests away from deleting orders', function () {
    $order = Order::factory()->create();

    $this->delete("/admin/orders/{$order->id}")->assertRedirect('/login');
    $this->delete('/admin/orders', ['ids' => [$order->id]])->assertRedirect('/login');

    expect(Order::query()->count())->toBe(1);
});

# Order {{ $order->order_number }} confirmed

Hello,

Thank you for your order of {{ $order->grandTotal()->format() }}. We'll email you again when it ships.

@foreach ($order->items as $item)
- {{ $item->quantity }} × {{ $item->product_title }} ({{ $item->total_amount->format() }})
@endforeach

[View your order]({{ $url }})

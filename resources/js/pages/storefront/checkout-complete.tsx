import { Button } from '@/components/ui/button';
import StorefrontLayout from '@/layouts/storefront-layout';
import { moneyValue, trackMetaEvent } from '@/lib/meta-pixel';
import { type OrderDetail, type SeoMeta } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface CheckoutCompleteProps {
    order: { data: OrderDetail };
    seo: SeoMeta;
}

export default function CheckoutComplete({ order, seo }: CheckoutCompleteProps) {
    const item = order.data;
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current || !item.is_paid || !item.meta_event_id) {
            return;
        }

        tracked.current = true;

        const lines = item.items ?? [];

        trackMetaEvent(
            'Purchase',
            {
                content_ids: lines.map((line) => String(line.product_variant_id ?? line.product_id ?? line.id)),
                content_type: 'product',
                value: moneyValue(item.grand_total.decimal),
                currency: item.currency,
                num_items: lines.reduce((sum, line) => sum + line.quantity, 0),
                contents: lines.map((line) => ({
                    id: String(line.product_variant_id ?? line.product_id ?? line.id),
                    quantity: line.quantity,
                    item_price: moneyValue(line.unit_price.decimal),
                })),
                order_id: item.order_number,
            },
            item.meta_event_id,
        );
    }, [item]);

    return (
        <StorefrontLayout>
            <Head title={seo.title} />

            <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
                <CheckCircle2 className="mx-auto mb-4 size-12 text-emerald-600" />
                <h1 className="text-3xl font-semibold tracking-tight">Thank you</h1>
                <p className="text-muted-foreground mt-2">
                    Order {item.order_number} is {item.status_label.toLowerCase()}. A confirmation will be sent to {item.email}.
                </p>

                <div className="mt-8 rounded-xl border border-neutral-200 p-6 text-left text-sm dark:border-neutral-800">
                    <ul className="space-y-2">
                        {(item.items ?? []).map((line) => (
                            <li key={line.id} className="flex justify-between">
                                <span>
                                    {line.product_title} × {line.quantity}
                                </span>
                                <span>{line.total.formatted}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{item.grand_total.formatted}</span>
                    </p>
                </div>

                <div className="mt-8 flex justify-center gap-3">
                    <Button asChild>
                        <Link href="/products">Continue shopping</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/account/orders">Order history</Link>
                    </Button>
                </div>
            </div>
        </StorefrontLayout>
    );
}

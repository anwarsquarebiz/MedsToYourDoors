import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type OrderDetail } from '@/types';
import { useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

interface AdminOrderShowProps {
    order: { data: OrderDetail };
}

export default function AdminOrderShow({ order }: AdminOrderShowProps) {
    const item = order.data;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Orders', href: '/admin/orders' },
        { title: item.order_number, href: `/admin/orders/${item.id}` },
    ];

    const statusForm = useForm({ status: item.allowed_transitions[0]?.value ?? item.status, note: '' });
    const refundForm = useForm({ amount: item.refundable.decimal, reason: '', restock: false });

    const updateStatus: FormEventHandler = (event) => {
        event.preventDefault();
        statusForm.patch(`/admin/orders/${item.id}/status`);
    };

    const refund: FormEventHandler = (event) => {
        event.preventDefault();
        refundForm.post(`/admin/orders/${item.id}/refunds`);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs} title={item.order_number} description={item.email}>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-medium">Items</h2>
                            <StatusBadge label={item.status_label} tone={item.status_tone} />
                        </div>
                        <ul className="space-y-2 text-sm">
                            {(item.items ?? []).map((line) => (
                                <li key={line.id} className="flex justify-between">
                                    <span>
                                        {line.product_title} × {line.quantity}
                                    </span>
                                    <span>{line.total.formatted}</span>
                                </li>
                            ))}
                        </ul>
                        <dl className="mt-4 space-y-1 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800">
                            <div className="flex justify-between">
                                <dt>Subtotal</dt>
                                <dd>{item.subtotal.formatted}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Shipping</dt>
                                <dd>{item.shipping.formatted}</dd>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <dt>Total</dt>
                                <dd>{item.grand_total.formatted}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                        <h2 className="font-medium">Timeline</h2>
                        <ol className="mt-3 space-y-2 text-sm">
                            {(item.timeline ?? []).map((event) => (
                                <li key={event.id}>
                                    <span className="font-medium">{event.to_status}</span>
                                    {event.note && <span className="text-muted-foreground"> — {event.note}</span>}
                                    <span className="block text-xs text-neutral-500">{event.created_at}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                <div className="space-y-6">
                    {item.allowed_transitions.length > 0 && (
                        <form onSubmit={updateStatus} className="space-y-3 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                            <h2 className="font-medium">Update status</h2>
                            <select
                                value={statusForm.data.status}
                                onChange={(event) => statusForm.setData('status', event.target.value)}
                                className="h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 text-sm dark:border-neutral-700"
                            >
                                {item.allowed_transitions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            <Input placeholder="Note" value={statusForm.data.note} onChange={(event) => statusForm.setData('note', event.target.value)} />
                            <Button type="submit" disabled={statusForm.processing} className="w-full">
                                Update
                            </Button>
                        </form>
                    )}

                    {item.is_refundable && (
                        <form onSubmit={refund} className="space-y-3 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
                            <h2 className="font-medium">Refund</h2>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={refundForm.data.amount}
                                onChange={(event) => refundForm.setData('amount', event.target.value)}
                            />
                            <Input placeholder="Reason" value={refundForm.data.reason} onChange={(event) => refundForm.setData('reason', event.target.value)} />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={refundForm.data.restock}
                                    onChange={(event) => refundForm.setData('restock', event.target.checked)}
                                />
                                Restock inventory
                            </label>
                            <Button type="submit" variant="outline" disabled={refundForm.processing} className="w-full">
                                Issue refund
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

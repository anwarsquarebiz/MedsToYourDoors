import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin' }];

export default function AdminDashboard() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs} title="Dashboard" description="An overview of your store's performance.">
            <div className="rounded-xl border border-neutral-200 p-8 text-center dark:border-neutral-800">
                <p className="text-muted-foreground text-sm">Sales and order metrics appear here once orders start coming in.</p>
            </div>
        </AdminLayout>
    );
}

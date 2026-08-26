import { FormCard, FormField } from '@/components/admin/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type IdOption, type SelectOption } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

interface NavigationItemRow {
    id: number;
    title: string;
    type: string;
    type_label: string;
    resource_id: number | null;
    url: string | null;
    position: number;
    destination: string;
}

interface AdminNavigationIndexProps {
    items: { data: NavigationItemRow[] } | NavigationItemRow[];
    link_types: SelectOption[];
    collections: IdOption[];
    pages: IdOption[];
    blogs: IdOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Navigation', href: '/admin/navigation' },
];

const selectClassName = 'h-10 w-full rounded-md border border-neutral-300 bg-transparent px-3 text-sm dark:border-neutral-700';

export default function AdminNavigationIndex({ items, link_types, collections, pages, blogs }: AdminNavigationIndexProps) {
    const rows = Array.isArray(items) ? items : items.data;

    return (
        <AdminLayout
            breadcrumbs={breadcrumbs}
            title="Navigation"
            description="Choose the links shown in the storefront header, the same way Shopify menus work."
        >
            <div className="space-y-6">
                {rows.length === 0 ? (
                    <div className="rounded-xl border border-neutral-200 p-12 text-center dark:border-neutral-800">
                        <p className="font-medium">No header links yet</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Until you add items, the header shows All products, published collections, and the journal.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                        {rows.map((item) => (
                            <NavigationItemEditor
                                key={item.id}
                                item={item}
                                linkTypes={link_types}
                                collections={collections}
                                pages={pages}
                                blogs={blogs}
                            />
                        ))}
                    </ul>
                )}

                <AddNavigationItemForm linkTypes={link_types} collections={collections} pages={pages} blogs={blogs} />
            </div>
        </AdminLayout>
    );
}

function AddNavigationItemForm({
    linkTypes,
    collections,
    pages,
    blogs,
}: {
    linkTypes: SelectOption[];
    collections: IdOption[];
    pages: IdOption[];
    blogs: IdOption[];
}) {
    const form = useForm({
        title: '',
        type: 'catalog',
        resource_id: null as number | null,
        url: '',
        position: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/admin/navigation', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <form onSubmit={submit}>
            <FormCard title="Add menu item" description="Name the link, then choose what it should open.">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField label="Name" htmlFor="new-title" error={form.errors.title} required>
                        <Input
                            id="new-title"
                            value={form.data.title}
                            onChange={(event) => form.setData('title', event.target.value)}
                            placeholder="All products"
                        />
                    </FormField>
                    <FormField label="Link to" htmlFor="new-type" error={form.errors.type} required>
                        <select
                            id="new-type"
                            value={form.data.type}
                            onChange={(event) => {
                                form.setData('type', event.target.value);
                                form.setData('resource_id', null);
                                form.setData('url', '');
                            }}
                            className={selectClassName}
                        >
                            {linkTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <ResourceFields
                        type={form.data.type}
                        resourceId={form.data.resource_id}
                        url={form.data.url}
                        errors={form.errors}
                        collections={collections}
                        pages={pages}
                        blogs={blogs}
                        idPrefix="new"
                        onResourceId={(value) => form.setData('resource_id', value)}
                        onUrl={(value) => form.setData('url', value)}
                    />
                </div>
                <Button type="submit" disabled={form.processing}>
                    Add menu item
                </Button>
            </FormCard>
        </form>
    );
}

function NavigationItemEditor({
    item,
    linkTypes,
    collections,
    pages,
    blogs,
}: {
    item: NavigationItemRow;
    linkTypes: SelectOption[];
    collections: IdOption[];
    pages: IdOption[];
    blogs: IdOption[];
}) {
    const form = useForm({
        title: item.title,
        type: item.type,
        resource_id: item.resource_id,
        url: item.url ?? '',
        position: String(item.position),
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.put(`/admin/navigation/${item.id}`, { preserveScroll: true });
    };

    return (
        <li className="p-4">
            <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_5.5rem_auto] lg:items-end">
                <FormField label="Name" htmlFor={`title-${item.id}`} error={form.errors.title} required>
                    <Input
                        id={`title-${item.id}`}
                        value={form.data.title}
                        onChange={(event) => form.setData('title', event.target.value)}
                    />
                </FormField>
                <FormField label="Link to" htmlFor={`type-${item.id}`} error={form.errors.type} required>
                    <select
                        id={`type-${item.id}`}
                        value={form.data.type}
                        onChange={(event) => {
                            form.setData('type', event.target.value);
                            form.setData('resource_id', null);
                            form.setData('url', '');
                        }}
                        className={selectClassName}
                    >
                        {linkTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </FormField>
                <ResourceFields
                    type={form.data.type}
                    resourceId={form.data.resource_id}
                    url={form.data.url}
                    errors={form.errors}
                    collections={collections}
                    pages={pages}
                    blogs={blogs}
                    idPrefix={`item-${item.id}`}
                    onResourceId={(value) => form.setData('resource_id', value)}
                    onUrl={(value) => form.setData('url', value)}
                />
                <FormField label="Order" htmlFor={`position-${item.id}`} error={form.errors.position}>
                    <Input
                        id={`position-${item.id}`}
                        type="number"
                        min={0}
                        value={form.data.position}
                        onChange={(event) => form.setData('position', event.target.value)}
                    />
                </FormField>
                <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={form.processing}>
                        Save
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.delete(`/admin/navigation/${item.id}`, { preserveScroll: true })}
                    >
                        Remove
                    </Button>
                </div>
            </form>
            <p className="text-muted-foreground mt-2 text-xs">Currently opens: {item.destination}</p>
        </li>
    );
}

function ResourceFields({
    type,
    resourceId,
    url,
    errors,
    collections,
    pages,
    blogs,
    idPrefix,
    onResourceId,
    onUrl,
}: {
    type: string;
    resourceId: number | null;
    url: string;
    errors: Partial<Record<string, string>>;
    collections: IdOption[];
    pages: IdOption[];
    blogs: IdOption[];
    idPrefix: string;
    onResourceId: (value: number | null) => void;
    onUrl: (value: string) => void;
}) {
    if (type === 'collection' || type === 'page' || type === 'blog') {
        const options = type === 'collection' ? collections : type === 'page' ? pages : blogs;
        const label = type === 'collection' ? 'Collection' : type === 'page' ? 'Page' : 'Blog';
        const empty = type === 'collection' ? 'No collections yet' : type === 'page' ? 'No pages yet' : 'No blogs yet';

        return (
            <FormField label={label} htmlFor={`${idPrefix}-resource`} error={errors.resource_id} required>
                <select
                    id={`${idPrefix}-resource`}
                    value={resourceId ?? ''}
                    onChange={(event) => onResourceId(event.target.value === '' ? null : Number(event.target.value))}
                    className={selectClassName}
                >
                    <option value="">{options.length === 0 ? empty : `Choose ${label.toLowerCase()}`}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </FormField>
        );
    }

    if (type === 'url') {
        return (
            <FormField label="URL" htmlFor={`${idPrefix}-url`} error={errors.url} hint="A path like /products or a full https:// URL." required>
                <Input
                    id={`${idPrefix}-url`}
                    value={url}
                    onChange={(event) => onUrl(event.target.value)}
                    placeholder="/products"
                />
            </FormField>
        );
    }

    return <p className="text-muted-foreground self-end text-sm">{type === 'home' ? 'Opens the home page.' : 'Opens the product catalogue.'}</p>;
}

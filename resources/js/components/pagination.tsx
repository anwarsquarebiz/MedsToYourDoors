import { type Paginated } from '@/types';
import { Link } from '@inertiajs/react';

interface PaginationProps {
    paginator: Pick<Paginated<unknown>, 'meta'>;
}

export function Pagination({ paginator }: PaginationProps) {
    const links = paginator.meta?.links ?? [];
    const from = paginator.meta?.from ?? null;
    const to = paginator.meta?.to ?? null;
    const total = paginator.meta?.total ?? 0;

    /** Laravel emits Previous/Next plus a page for each number; hide when there is one page. */
    if (!Array.isArray(links) || links.length <= 3) {
        return null;
    }

    return (
        <nav className="flex flex-col items-center justify-between gap-4 sm:flex-row" aria-label="Pagination">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Showing {from ?? 0}–{to ?? 0} of {total}
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, index) =>
                    link.url === null ? (
                        <span
                            key={index}
                            className="rounded-md px-3 py-2 text-sm text-neutral-400 dark:text-neutral-600"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={`rounded-md px-3 py-2 text-sm transition-colors ${
                                link.active
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ),
                )}
            </div>
        </nav>
    );
}

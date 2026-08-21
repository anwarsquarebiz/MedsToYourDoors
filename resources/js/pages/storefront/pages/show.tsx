import StorefrontLayout from '@/layouts/storefront-layout';
import { type CmsPage, type SeoMeta } from '@/types';
import { Head } from '@inertiajs/react';

interface PageShowProps {
    page: { data: CmsPage };
    seo: SeoMeta;
}

export default function StorefrontPageShow({ page, seo }: PageShowProps) {
    const item = page.data;

    return (
        <StorefrontLayout>
            <Head title={seo.title}>{seo.description && <meta name="description" content={seo.description} />}</Head>

            <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
                <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
                {item.excerpt && <p className="text-muted-foreground mt-3 text-lg">{item.excerpt}</p>}
                {item.content && (
                    <div className="prose dark:prose-invert mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                )}
            </article>
        </StorefrontLayout>
    );
}

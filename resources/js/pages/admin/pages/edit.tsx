import { PageEditor } from '@/pages/admin/pages/index';
import { type CmsPage, type SelectOption } from '@/types';

export default function EditPage({ page, statuses }: { page: { data: CmsPage }; statuses: SelectOption[] }) {
    return <PageEditor page={page.data} statuses={statuses} />;
}

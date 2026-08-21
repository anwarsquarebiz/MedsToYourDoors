import { PageEditor } from '@/pages/admin/pages/index';
import { type SelectOption } from '@/types';

export default function CreatePage({ statuses }: { statuses: SelectOption[] }) {
    return <PageEditor statuses={statuses} />;
}

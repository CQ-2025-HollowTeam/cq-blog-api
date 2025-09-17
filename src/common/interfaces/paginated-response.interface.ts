import { PageMeta } from './page-meta.interface';

export interface PaginatedResponse<T> {
    data: T[];
    meta: PageMeta;
}

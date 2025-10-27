import { PaginationParams } from '../types/pagination.types';

export interface PaginationResult {
    page: number;
    limit: number;
    skip: number;
}

export function getPagination(pagination: PaginationParams | undefined): PaginationResult {

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    return { page: safePage, limit: safeLimit, skip };
}
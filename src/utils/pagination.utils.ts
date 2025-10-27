import { PaginationParams } from '../types/pagination.types';

export interface PaginationResult {
    page: number;
    limit: number;
    skip: number;
}

export function getPagination(pagination: PaginationParams | undefined): PaginationResult {

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;

    const skip = (page - 1) * limit;

    return { page, limit, skip };
}
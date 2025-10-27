import { PaginationParams } from "./pagination.types";

export interface UserQueryOptions {
    email?: string;
    firstName?: string;
    lastName?: string;
    pagination?: PaginationParams;
}
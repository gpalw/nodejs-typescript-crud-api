import { PaginationParams } from "../types/pagination.types";
import { getPagination } from "../utils/pagination.utils";

describe('getPagination Utility', () => {

    it('should use provided page and limit', () => {
        const params: PaginationParams = { page: 3, limit: 20 };
        const result = getPagination(params);

        expect(result.page).toBe(3);
        expect(result.limit).toBe(20);
        expect(result.skip).toBe(40); // (3 - 1) * 20
    });

    it('should return default page (1) and limit (10) when input is undefined', () => {
        const result = getPagination(undefined);

        expect(result.page).toBe(1);      // trigger || 1
        expect(result.limit).toBe(10);     // trigger || 10
        expect(result.skip).toBe(0);      // (1 - 1) * 10
    });

    it('should default page to 1 when page is not provided', () => {

        const params: PaginationParams = { limit: 5 };
        const result = getPagination(params);

        expect(result.page).toBe(1);      // trigger || 1
        expect(result.limit).toBe(5);
        expect(result.skip).toBe(0);      // (1 - 1) * 5
    });

    it('should default limit to 10 when limit is not provided', () => {

        const params: PaginationParams = { page: 4 };
        const result = getPagination(params);

        expect(result.page).toBe(4);
        expect(result.limit).toBe(10);     // trigger || 10
        expect(result.skip).toBe(30);     // (4 - 1) * 10
    });

});
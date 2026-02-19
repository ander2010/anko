import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";

/**
 * Hook to manage pagination state synced with URL query parameters.
 * @param {number} defaultPageSize - Default number of items per page.
 * @param {string} prefix - Optional prefix for parameter names (e.g. 'topics' -> 'topicsPage')
 */
export function usePaginationParams(defaultPageSize = 10, prefix = "") {
    const [searchParams, setSearchParams] = useSearchParams();

    const pageKey = prefix ? `${prefix}Page` : "page";
    const pageSizeKey = prefix ? `${prefix}PageSize` : "pageSize";

    const page = useMemo(() => {
        const p = parseInt(searchParams.get(pageKey) || "1", 10);
        return isNaN(p) || p < 1 ? 1 : p;
    }, [searchParams, pageKey]);

    const pageSize = useMemo(() => {
        const s = parseInt(searchParams.get(pageSizeKey) || defaultPageSize.toString(), 10);
        return isNaN(s) || s < 1 ? defaultPageSize : s;
    }, [searchParams, pageSizeKey, defaultPageSize]);

    const setPage = useCallback((newPage) => {
        setSearchParams((params) => {
            params.set(pageKey, newPage.toString());
            return params;
        }, { replace: true });
    }, [setSearchParams, pageKey]);

    const setPageSize = useCallback((newPageSize) => {
        setSearchParams((params) => {
            params.set(pageSizeKey, newPageSize.toString());
            params.set(pageKey, "1"); // Reset to first page when size changes
            return params;
        }, { replace: true });
    }, [setSearchParams, pageSizeKey, pageKey]);

    return {
        page,
        pageSize,
        setPage,
        setPageSize
    };
}

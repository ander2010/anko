import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";

/**
 * Hook to manage pagination state synced with URL query parameters.
 * @param {number} defaultPageSize - Default number of items per page.
 */
export function usePaginationParams(defaultPageSize = 10) {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = useMemo(() => {
        const p = parseInt(searchParams.get("page") || "1", 10);
        return isNaN(p) || p < 1 ? 1 : p;
    }, [searchParams]);

    const pageSize = useMemo(() => {
        const s = parseInt(searchParams.get("pageSize") || defaultPageSize.toString(), 10);
        return isNaN(s) || s < 1 ? defaultPageSize : s;
    }, [searchParams, defaultPageSize]);

    const setPage = useCallback((newPage) => {
        setSearchParams((params) => {
            params.set("page", newPage.toString());
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const setPageSize = useCallback((newPageSize) => {
        setSearchParams((params) => {
            params.set("pageSize", newPageSize.toString());
            params.set("page", "1"); // Reset to first page when size changes
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    return {
        page,
        pageSize,
        setPage,
        setPageSize
    };
}

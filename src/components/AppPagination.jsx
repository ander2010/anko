import React from "react";
import {
    Pagination,
    Select,
    MenuItem,
    Typography,
    Stack,
    Box,
    FormControl,
} from "@mui/material";
import { useLanguage } from "@/context/language-context";

/**
 * Shared Pagination Component using MUI.
 * @param {number} page - Current page (1-indexed).
 * @param {number} pageSize - Number of items per page.
 * @param {number} totalCount - Total number of items across all pages.
 * @param {function} onPageChange - Callback when page changes (newPage).
 * @param {function} onPageSizeChange - Callback when page size changes (newPageSize).
 * @param {boolean} disabled - Whether the controls should be disabled.
 */
export function AppPagination({
    page,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    disabled = false,
}) {
    const { language } = useLanguage();

    const totalPages = Math.ceil(totalCount / pageSize);
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);

    const handlePageChange = (event, value) => {
        onPageChange(value);
    };

    const handlePageSizeChange = (event) => {
        onPageSizeChange(event.target.value);
    };

    return (
        <>
            {/* ── MOBILE: compact pagination ── */}
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "center", gap: 1.5, mt: 2, mb: 1 }}>
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={disabled || page <= 1}
                    style={{
                        width: 28, height: 28, borderRadius: "50%", border: "0.5px solid rgba(0,0,0,0.12)",
                        background: page <= 1 ? "#f5f5f5" : "#fff", color: page <= 1 ? "#ccc" : "#534AB7",
                        fontSize: 14, fontWeight: 600, cursor: page <= 1 ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    ‹
                </button>
                <span style={{ fontSize: "11px", color: "#888", fontWeight: 500 }}>
                    {page} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={disabled || page >= totalPages}
                    style={{
                        width: 28, height: 28, borderRadius: "50%", border: "0.5px solid rgba(0,0,0,0.12)",
                        background: page >= totalPages ? "#f5f5f5" : "#7F77DD", color: page >= totalPages ? "#ccc" : "#fff",
                        fontSize: 14, fontWeight: 600, cursor: page >= totalPages ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    ›
                </button>
                <span style={{ fontSize: "9px", color: "#bbb", marginLeft: 4 }}>
                    {totalCount} {language === "es" ? "total" : "total"}
                </span>
            </Box>

            {/* ── DESKTOP: full pagination ── */}
            <Box
                sx={{
                    display: { xs: "none", md: "flex" },
                    width: "100%",
                    mt: 4,
                    p: 2,
                    backgroundColor: "white",
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <Typography variant="body2" sx={{ color: "zinc.500", fontWeight: 500, fontFamily: "inherit" }}>
                    {language === "es"
                        ? `Mostrando ${from}–${to} de ${totalCount}`
                        : `Showing ${from}–${to} of ${totalCount}`}
                </Typography>

                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    disabled={disabled || totalPages <= 1}
                    color="primary"
                    size="medium"
                    sx={{ "& .MuiPaginationItem-root": { borderRadius: "8px" } }}
                />

                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ color: "zinc.500", fontWeight: 500, fontFamily: "inherit" }}>
                        {language === "es" ? "Por página:" : "Per page:"}
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 70 }}>
                        <Select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            disabled={disabled}
                            sx={{
                                borderRadius: "10px",
                                backgroundColor: "zinc.50",
                                "& .MuiSelect-select": { py: 1, fontSize: "0.875rem", fontWeight: 500 },
                            }}
                        >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                            <MenuItem value={100}>100</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Box>
        </>
    );
}

export default AppPagination;

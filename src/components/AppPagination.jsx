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

    // Premium UI: Card-like container with subtle borders and balanced spacing
    return (
        <Box
            sx={{
                width: "100%",
                mt: 4,
                p: 2,
                backgroundColor: "white",
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
            }}
        >
            {/* Left side: "Showing X-Y of Z" */}
            <Typography
                variant="body2"
                sx={{
                    color: "zinc.500",
                    fontWeight: 500,
                    fontFamily: "inherit",
                }}
            >
                {language === "es"
                    ? `Mostrando ${from}–${to} de ${totalCount}`
                    : `Showing ${from}–${to} of ${totalCount}`}
            </Typography>

            {/* Center: Pagination controls */}
            <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                disabled={disabled || totalPages <= 1}
                color="primary"
                size="medium"
                sx={{
                    "& .MuiPaginationItem-root": {
                        borderRadius: "8px",
                    },
                }}
            />

            {/* Right side: Page size selector */}
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                    variant="body2"
                    sx={{
                        color: "zinc.500",
                        fontWeight: 500,
                        fontFamily: "inherit",
                    }}
                >
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
                            "& .MuiSelect-select": {
                                py: 1,
                                fontSize: "0.875rem",
                                fontWeight: 500,
                            },
                        }}
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        </Box>
    );
}

export default AppPagination;

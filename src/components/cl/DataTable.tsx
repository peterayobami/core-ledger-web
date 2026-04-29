import * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
    key: string;
    header: string;
    width?: number | string;
    align?: "left" | "right" | "center";
    cell: (row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string;
    onRowClick?: (row: T) => void;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick }: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th
                                key={c.key}
                                className={cn(
                                    "text-left text-[11px] font-medium uppercase tracking-wider px-5 py-3",
                                    c.align === "right" && "text-right",
                                    c.align === "center" && "text-center"
                                )}
                                style={{ color: "var(--cl-primary)", width: c.width }}
                            >
                                {c.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={rowKey(row)}
                            onClick={() => onRowClick?.(row)}
                            className={cn(
                                "border-t border-[var(--cl-divider)]/50 transition-colors",
                                onRowClick && "cursor-pointer hover:bg-[rgba(24,79,151,0.04)]"
                            )}
                        >
                            {columns.map((c) => (
                                <td
                                    key={c.key}
                                    className={cn(
                                        "px-5 align-middle text-sm text-[var(--cl-text)]",
                                        c.align === "right" && "text-right",
                                        c.align === "center" && "text-center",
                                        c.className
                                    )}
                                    style={{ height: 52, width: c.width }}
                                >
                                    {c.cell(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

interface PaginationBarProps {
    total: number;
    page: number;
    totalPages: number;
    label: string;
    onPageChange: (p: number) => void;
}
export function PaginationBar({ total, page, totalPages, label, onPageChange }: PaginationBarProps) {
    return (
        <div
            className="mt-4 flex items-center justify-between px-5 py-3 text-sm text-[var(--cl-text-muted)] bg-white rounded-xl border border-[var(--cl-border)]"
            style={{ boxShadow: "0 2px 4px rgba(102,102,102,0.035), 0 0 8px rgba(102,102,102,0.059)" }}
        >
            <span>
                <span className="mono text-[var(--cl-text)] font-medium">{total.toLocaleString()}</span> total {label}
            </span>
            <div className="flex items-center gap-3">
                <button
                    className="p-1.5 rounded-md hover:bg-[var(--cl-alpha)] disabled:opacity-30 disabled:hover:bg-transparent"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <span className="mono text-[var(--cl-text)]">Page {page} of {totalPages}</span>
                <button
                    className="p-1.5 rounded-md hover:bg-[var(--cl-alpha)] disabled:opacity-30 disabled:hover:bg-transparent"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>
        </div>
    );
}

export function ListToolbar({ search, setSearch, placeholder, action }: {
    search: string; setSearch: (s: string) => void; placeholder: string; action: React.ReactNode;
}) {
    return (
        <div
            className="mb-4 flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[var(--cl-border)]"
            style={{ boxShadow: "0 2px 4px rgba(102,102,102,0.035), 0 0 8px rgba(102,102,102,0.059)" }}
        >
            <div className="relative w-[350px] max-w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cl-text-faded)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-[40px] pl-9 pr-3 text-sm bg-[var(--cl-input)] rounded-[10px] border-0 outline-none placeholder:text-[#BEBEBE] focus:ring-[1.2px] focus:ring-[var(--cl-primary)]"
                />
            </div>
            <div className="ml-auto">{action}</div>
        </div>
    );
}

export function PageCard({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="bg-white rounded-xl border border-[var(--cl-border)] overflow-hidden"
            style={{ boxShadow: "0 2px 4px rgba(102,102,102,0.035), 0 0 8px rgba(102,102,102,0.059)" }}
        >
            {children}
        </div>
    );
}

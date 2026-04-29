import * as React from "react";
import { useRouter } from "next/router";
import { Plus, TrendingUp, WifiOff, Coins, Percent, FileBarChart, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageHeader } from "@/components/cl/Card";
import { Button } from "@/components/cl/Button";
import { DataTable, ListToolbar, PageCard, PaginationBar } from "@/components/cl/DataTable";
import { ProgressBar, TableShimmer } from "@/components/cl/Shimmer";
import { EmptyState } from "@/components/cl/EmptyError";
import { YesNoTag, Tag } from "@/components/cl/Tag";
import { KpiStrip } from "@/components/cl/KpiStrip";
import { api, getCustomer, getRevenueCategory, useStoreVersion, revenues as allRevenues } from "@/data/store";
import type { Revenue } from "@/data/types";
import { formatDate, formatNaira } from "@/lib/format";
import { RevenueFormPanel } from "@/features/revenue/RevenueFormPanel";

export default function RevenueListPage() {
    const router = useRouter();
    const [search, setSearch] = React.useState("");
    const [debounced, setDebounced] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [data, setData] = React.useState<Awaited<ReturnType<typeof api.listRevenues>> | null>(null);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [refetching, setRefetching] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState<Revenue | null>(null);
    const [panelOpen, setPanelOpen] = React.useState(false);
    const version = useStoreVersion();

    React.useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);
    React.useEffect(() => {
        let cancelled = false;
        if (data === null) setInitialLoading(true); else setRefetching(true);
        setError(null);
        api.listRevenues(debounced, page).then((r) => { if (!cancelled) setData(r); }).catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load."); }).finally(() => { if (!cancelled) { setInitialLoading(false); setRefetching(false); } });
        return () => { cancelled = true; };
    }, [debounced, page, version]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalSales = React.useMemo(() => allRevenues.reduce((s, r) => s + r.salesAmount, 0), [version]);
    const totalVat = React.useMemo(() => allRevenues.reduce((s, r) => s + r.vatAmount, 0), [version]);
    const totalWht = React.useMemo(() => allRevenues.reduce((s, r) => s + r.whtAmount, 0), [version]);
    const mtd = React.useMemo(() => { const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); return allRevenues.filter((r) => new Date(r.date) >= start).reduce((s, r) => s + r.salesAmount, 0); }, [version]);

    return (
        <>
            <TopBar title="Revenue" breadcrumbs={["Transactions", "Revenue"]} />
            <div className="px-7 py-6">
                <PageHeader title="Revenue" subtitle="Manage sales invoices and recognised revenue." />
                <KpiStrip items={[
                    { label: "Total Revenue", value: `₦${formatNaira(totalSales, { decimals: 0 })}`, hint: `${allRevenues.length} invoices`, accent: "var(--cl-success-variant)", icon: <Coins size={18} /> },
                    { label: "Output VAT", value: `₦${formatNaira(totalVat, { decimals: 0 })}`, hint: "Payable to FIRS", accent: "var(--cl-primary)", icon: <Percent size={18} /> },
                    { label: "WHT Credits", value: `₦${formatNaira(totalWht, { decimals: 0 })}`, hint: "Withheld by customers", accent: "var(--cl-orange)", icon: <FileBarChart size={18} /> },
                    { label: "Month To Date", value: `₦${formatNaira(mtd, { decimals: 0 })}`, hint: "Current month", accent: "var(--cl-skyblue)", icon: <Calendar size={18} /> },
                ]} />
                <ListToolbar search={search} setSearch={(s) => { setSearch(s); setPage(1); }} placeholder="Search by description or invoice…"
                    action={<Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setPanelOpen(true); }}>New Revenue</Button>} />
                <PageCard>
                    <ProgressBar active={refetching && !initialLoading} />
                    {initialLoading ? <TableShimmer columns={7} rows={8} /> :
                        error ? <EmptyState tone="danger" icon={<WifiOff size={36} strokeWidth={1.6} />} title="Could not load revenue" body={error} action={{ label: "Try Again", onClick: () => setData(null) }} /> :
                            !data || data.items.length === 0 ? <EmptyState icon={<TrendingUp size={36} strokeWidth={1.6} />} title={debounced ? "No results found" : "No revenue recorded"} body={debounced ? "No invoices matched your search." : "Revenue you record will appear here."} /> :
                                <DataTable<Revenue>
                                    rowKey={(r) => r.id} onRowClick={(r) => router.push(`/transactions/revenue/${r.id}`)} rows={data.items}
                                    columns={[
                                        { key: "date", header: "Date", width: 110, cell: (r) => <span className="mono text-[var(--cl-text-muted)]">{formatDate(r.date)}</span> },
                                        { key: "inv", header: "Invoice #", width: 170, cell: (r) => <span className="mono">{r.invoiceNumber}</span> },
                                        { key: "desc", header: "Description", cell: (r) => <span className="truncate block max-w-[26ch]" title={r.description}>{r.description}</span> },
                                        { key: "cust", header: "Customer", width: 200, cell: (r) => <span className="text-[var(--cl-text-muted)] truncate block max-w-[24ch]">{getCustomer(r.customerId)?.name ?? "—"}</span> },
                                        { key: "cat", header: "Category", width: 160, cell: (r) => <Tag tone="skyblue">{getRevenueCategory(r.categoryId)?.name ?? "—"}</Tag> },
                                        { key: "amt", header: "Sales", width: 150, align: "right", cell: (r) => <span className="mono">₦{formatNaira(r.salesAmount)}</span> },
                                        { key: "vat", header: "VAT", width: 90, align: "center", cell: (r) => <YesNoTag value={r.isTaxableSupply} /> },
                                    ]}
                                />}
                </PageCard>
                {data && data.items.length > 0 && <PaginationBar total={data.total} page={data.page} totalPages={data.totalPages} label="revenues" onPageChange={setPage} />}
                <RevenueFormPanel open={panelOpen} mode={editing ? "edit" : "create"} initial={editing} onClose={() => setPanelOpen(false)} onSaved={() => setPanelOpen(false)} />
            </div>
        </>
    );
}

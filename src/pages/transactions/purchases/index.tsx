import * as React from "react";
import { useRouter } from "next/router";
import { Plus, ShoppingCart, WifiOff, Coins, Percent, FileBarChart, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageHeader } from "@/components/cl/Card";
import { Button } from "@/components/cl/Button";
import { DataTable, ListToolbar, PageCard, PaginationBar } from "@/components/cl/DataTable";
import { ProgressBar, TableShimmer } from "@/components/cl/Shimmer";
import { EmptyState } from "@/components/cl/EmptyError";
import { YesNoTag } from "@/components/cl/Tag";
import { KpiStrip } from "@/components/cl/KpiStrip";
import { api, getVendor, useStoreVersion, purchases as allPurchases } from "@/data/store";
import type { Purchase } from "@/data/types";
import { formatDate, formatNaira } from "@/lib/format";
import { PurchaseFormPanel } from "@/features/purchases/PurchaseFormPanel";

export default function PurchasesListPage() {
    const router = useRouter();
    const [search, setSearch] = React.useState("");
    const [debounced, setDebounced] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [data, setData] = React.useState<Awaited<ReturnType<typeof api.listPurchases>> | null>(null);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [refetching, setRefetching] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState<Purchase | null>(null);
    const [panelOpen, setPanelOpen] = React.useState(false);
    const version = useStoreVersion();

    React.useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);
    React.useEffect(() => {
        let cancelled = false;
        if (data === null) setInitialLoading(true); else setRefetching(true);
        setError(null);
        api.listPurchases(debounced, page).then((r) => { if (!cancelled) setData(r); }).catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load."); }).finally(() => { if (!cancelled) { setInitialLoading(false); setRefetching(false); } });
        return () => { cancelled = true; };
    }, [debounced, page, version]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalCost = React.useMemo(() => allPurchases.reduce((s, p) => s + p.cost, 0), [version]);
    const totalVat = React.useMemo(() => allPurchases.reduce((s, p) => s + p.vatAmount, 0), [version]);
    const totalWht = React.useMemo(() => allPurchases.reduce((s, p) => s + p.whtAmount, 0), [version]);
    const mtd = React.useMemo(() => { const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); return allPurchases.filter((p) => new Date(p.datePurchased) >= start).reduce((s, p) => s + p.cost, 0); }, [version]);

    return (
        <>
            <TopBar title="Purchases" breadcrumbs={["Transactions", "Purchases"]} />
            <div className="px-7 py-6">
                <PageHeader title="Purchases" subtitle="Capture and reconcile all purchase invoices." />
                <KpiStrip items={[
                    { label: "Total Purchase Value", value: `₦${formatNaira(totalCost, { decimals: 0 })}`, hint: `${allPurchases.length} invoices`, accent: "var(--cl-skyblue)", icon: <Coins size={18} /> },
                    { label: "VAT Recoverable", value: `₦${formatNaira(totalVat, { decimals: 0 })}`, hint: "Input VAT", accent: "var(--cl-success-variant)", icon: <Percent size={18} /> },
                    { label: "WHT Withheld", value: `₦${formatNaira(totalWht, { decimals: 0 })}`, hint: "Remittable to FIRS", accent: "var(--cl-orange)", icon: <FileBarChart size={18} /> },
                    { label: "Month To Date", value: `₦${formatNaira(mtd, { decimals: 0 })}`, hint: "Current month", accent: "var(--cl-primary)", icon: <Calendar size={18} /> },
                ]} />
                <ListToolbar search={search} setSearch={(s) => { setSearch(s); setPage(1); }} placeholder="Search by description or invoice…"
                    action={<Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setPanelOpen(true); }}>New Purchase</Button>} />
                <PageCard>
                    <ProgressBar active={refetching && !initialLoading} />
                    {initialLoading ? <TableShimmer columns={7} rows={8} /> :
                        error ? <EmptyState tone="danger" icon={<WifiOff size={36} strokeWidth={1.6} />} title="Could not load purchases" body={error} action={{ label: "Try Again", onClick: () => setData(null) }} /> :
                            !data || data.items.length === 0 ? <EmptyState icon={<ShoppingCart size={36} strokeWidth={1.6} />} title={debounced ? "No results found" : "No purchases recorded"} body={debounced ? "No invoices matched your search." : "Purchases you record will appear here."} /> :
                                <DataTable<Purchase>
                                    rowKey={(p) => p.id} onRowClick={(p) => router.push(`/transactions/purchases/${p.id}`)} rows={data.items}
                                    columns={[
                                        { key: "date", header: "Date", width: 110, cell: (p) => <span className="mono text-[var(--cl-text-muted)]">{formatDate(p.datePurchased)}</span> },
                                        { key: "inv", header: "Invoice #", width: 160, cell: (p) => <span className="mono">{p.invoiceNumber}</span> },
                                        { key: "desc", header: "Description", cell: (p) => <span className="truncate block max-w-[26ch]" title={p.description}>{p.description}</span> },
                                        { key: "vendor", header: "Vendor", width: 200, cell: (p) => <span className="text-[var(--cl-text-muted)] truncate block max-w-[24ch]">{getVendor(p.vendorId)?.name ?? "—"}</span> },
                                        { key: "cost", header: "Cost", width: 140, align: "right", cell: (p) => <span className="mono">₦{formatNaira(p.cost)}</span> },
                                        { key: "vat", header: "VAT", width: 90, align: "center", cell: (p) => <YesNoTag value={p.isVatApplicable} /> },
                                        { key: "wht", header: "WHT", width: 90, align: "center", cell: (p) => p.isWhtApplicable ? <span className="mono text-xs text-[var(--cl-text)]">{p.whtRate}%</span> : <YesNoTag value={false} /> },
                                    ]}
                                />}
                </PageCard>
                {data && data.items.length > 0 && <PaginationBar total={data.total} page={data.page} totalPages={data.totalPages} label="purchases" onPageChange={setPage} />}
                <PurchaseFormPanel open={panelOpen} mode={editing ? "edit" : "create"} initial={editing} onClose={() => setPanelOpen(false)} onSaved={() => setPanelOpen(false)} />
            </div>
        </>
    );
}

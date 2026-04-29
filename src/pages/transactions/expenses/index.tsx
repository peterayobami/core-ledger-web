import * as React from "react";
import { useRouter } from "next/router";
import { Plus, Receipt, WifiOff, Coins, Percent, ShieldOff, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageHeader } from "@/components/cl/Card";
import { Button } from "@/components/cl/Button";
import { DataTable, ListToolbar, PageCard, PaginationBar } from "@/components/cl/DataTable";
import { ProgressBar, TableShimmer } from "@/components/cl/Shimmer";
import { EmptyState } from "@/components/cl/EmptyError";
import { YesNoTag, Tag } from "@/components/cl/Tag";
import { KpiStrip } from "@/components/cl/KpiStrip";
import { api, getVendor, getExpenseCategory, useStoreVersion, expenses as allExpenses } from "@/data/store";
import type { Expense } from "@/data/types";
import { formatDate, formatNaira } from "@/lib/format";
import { ExpenseFormPanel } from "@/features/expenses/ExpenseFormPanel";

export default function ExpensesListPage() {
    const router = useRouter();
    const [search, setSearch] = React.useState("");
    const [debounced, setDebounced] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [data, setData] = React.useState<Awaited<ReturnType<typeof api.listExpenses>> | null>(null);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [refetching, setRefetching] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState<Expense | null>(null);
    const [panelOpen, setPanelOpen] = React.useState(false);
    const version = useStoreVersion();

    React.useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);
    React.useEffect(() => {
        let cancelled = false;
        if (data === null) setInitialLoading(true); else setRefetching(true);
        setError(null);
        api.listExpenses(debounced, page).then((r) => { if (!cancelled) setData(r); }).catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load."); }).finally(() => { if (!cancelled) { setInitialLoading(false); setRefetching(false); } });
        return () => { cancelled = true; };
    }, [debounced, page, version]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalCost = React.useMemo(() => allExpenses.reduce((s, e) => s + e.cost, 0), [version]);
    const deductible = React.useMemo(() => allExpenses.filter((e) => e.isTaxDeductible).reduce((s, e) => s + e.cost, 0), [version]);
    const nonDeductible = React.useMemo(() => allExpenses.filter((e) => !e.isTaxDeductible).reduce((s, e) => s + e.cost, 0), [version]);
    const mtd = React.useMemo(() => { const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); return allExpenses.filter((e) => new Date(e.date) >= start).reduce((s, e) => s + e.cost, 0); }, [version]);

    return (
        <>
            <TopBar title="Expenses" breadcrumbs={["Transactions", "Expenses"]} />
            <div className="px-7 py-6">
                <PageHeader title="Expenses" subtitle="Track operating expenses with deductibility flags." />
                <KpiStrip items={[
                    { label: "Total Expenses", value: `₦${formatNaira(totalCost, { decimals: 0 })}`, hint: `${allExpenses.length} entries`, accent: "var(--cl-orange)", icon: <Coins size={18} /> },
                    { label: "Tax-Deductible", value: `₦${formatNaira(deductible, { decimals: 0 })}`, hint: "Allowable for CIT", accent: "var(--cl-success-variant)", icon: <Percent size={18} /> },
                    { label: "Non-Deductible", value: `₦${formatNaira(nonDeductible, { decimals: 0 })}`, hint: "Add-back items", accent: "var(--cl-danger)", icon: <ShieldOff size={18} /> },
                    { label: "Month To Date", value: `₦${formatNaira(mtd, { decimals: 0 })}`, hint: "Current month", accent: "var(--cl-primary)", icon: <Calendar size={18} /> },
                ]} />
                <ListToolbar search={search} setSearch={(s) => { setSearch(s); setPage(1); }} placeholder="Search by description or invoice…"
                    action={<Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setPanelOpen(true); }}>New Expense</Button>} />
                <PageCard>
                    <ProgressBar active={refetching && !initialLoading} />
                    {initialLoading ? <TableShimmer columns={7} rows={8} /> :
                        error ? <EmptyState tone="danger" icon={<WifiOff size={36} strokeWidth={1.6} />} title="Could not load expenses" body={error} action={{ label: "Try Again", onClick: () => setData(null) }} /> :
                            !data || data.items.length === 0 ? <EmptyState icon={<Receipt size={36} strokeWidth={1.6} />} title={debounced ? "No results found" : "No expenses recorded"} body={debounced ? "No expenses matched your search." : "Expenses you record will appear here."} /> :
                                <DataTable<Expense>
                                    rowKey={(e) => e.id} onRowClick={(e) => router.push(`/transactions/expenses/${e.id}`)} rows={data.items}
                                    columns={[
                                        { key: "date", header: "Date", width: 110, cell: (e) => <span className="mono text-[var(--cl-text-muted)]">{formatDate(e.date)}</span> },
                                        { key: "inv", header: "Invoice #", width: 150, cell: (e) => <span className="mono">{e.invoiceNumber}</span> },
                                        { key: "desc", header: "Description", cell: (e) => <span className="truncate block max-w-[26ch]" title={e.description}>{e.description}</span> },
                                        { key: "supp", header: "Supplier", width: 200, cell: (e) => <span className="text-[var(--cl-text-muted)] truncate block max-w-[24ch]">{getVendor(e.supplierId)?.name ?? "—"}</span> },
                                        { key: "cat", header: "Category", width: 170, cell: (e) => <Tag tone="orange">{getExpenseCategory(e.categoryId)?.name ?? "—"}</Tag> },
                                        { key: "cost", header: "Cost", width: 140, align: "right", cell: (e) => <span className="mono">₦{formatNaira(e.cost)}</span> },
                                        { key: "ded", header: "Deductible", width: 110, align: "center", cell: (e) => <YesNoTag value={e.isTaxDeductible} /> },
                                    ]}
                                />}
                </PageCard>
                {data && data.items.length > 0 && <PaginationBar total={data.total} page={data.page} totalPages={data.totalPages} label="expenses" onPageChange={setPage} />}
                <ExpenseFormPanel open={panelOpen} mode={editing ? "edit" : "create"} initial={editing} onClose={() => setPanelOpen(false)} onSaved={() => setPanelOpen(false)} />
            </div>
        </>
    );
}

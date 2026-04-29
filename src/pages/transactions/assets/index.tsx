import * as React from "react";
import { useRouter } from "next/router";
import { Plus, Boxes, WifiOff, Layers, Coins, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageHeader } from "@/components/cl/Card";
import { Button } from "@/components/cl/Button";
import { DataTable, ListToolbar, PageCard, PaginationBar } from "@/components/cl/DataTable";
import { ProgressBar, TableShimmer } from "@/components/cl/Shimmer";
import { EmptyState } from "@/components/cl/EmptyError";
import { Tag } from "@/components/cl/Tag";
import { KpiStrip } from "@/components/cl/KpiStrip";
import { api, getClassification, useStoreVersion, assets as allAssets } from "@/data/store";
import type { Asset } from "@/data/types";
import { formatDate, formatNaira } from "@/lib/format";
import { AssetFormPanel } from "@/features/assets/AssetFormPanel";

export default function AssetsListPage() {
    const router = useRouter();
    const [search, setSearch] = React.useState("");
    const [debounced, setDebounced] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [data, setData] = React.useState<Awaited<ReturnType<typeof api.listAssets>> | null>(null);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [refetching, setRefetching] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState<Asset | null>(null);
    const [panelOpen, setPanelOpen] = React.useState(false);
    const version = useStoreVersion();

    React.useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);

    React.useEffect(() => {
        let cancelled = false;
        if (data === null) setInitialLoading(true); else setRefetching(true);
        setError(null);
        api.listAssets(debounced, page)
            .then((r) => { if (!cancelled) setData(r); })
            .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load."); })
            .finally(() => { if (!cancelled) { setInitialLoading(false); setRefetching(false); } });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced, page, version]);

    const totalCost = React.useMemo(() => allAssets.reduce((s, a) => s + a.cost, 0), [version]);
    const ytdCost = React.useMemo(() => {
        const start = new Date(); start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
        return allAssets.filter((a) => new Date(a.datePurchased) >= start).reduce((s, a) => s + a.cost, 0);
    }, [version]);
    const distinctClasses = React.useMemo(() => new Set(allAssets.map((a) => a.classificationId)).size, [version]);

    return (
        <>
            <TopBar title="Assets" breadcrumbs={["Transactions", "Assets"]} />
            <div className="px-7 py-6">
                <PageHeader title="Assets" subtitle="Track and manage all company assets." />
                <KpiStrip items={[
                    { label: "Total Asset Cost", value: `₦${formatNaira(totalCost, { decimals: 0 })}`, hint: `${allAssets.length} records`, accent: "var(--cl-primary)", icon: <Coins size={18} /> },
                    { label: "Acquired YTD", value: `₦${formatNaira(ytdCost, { decimals: 0 })}`, hint: "Since Jan 1", accent: "var(--cl-success-variant)", icon: <Calendar size={18} /> },
                    { label: "Classifications In Use", value: String(distinctClasses), hint: "Categories", accent: "var(--cl-skyblue)", icon: <Layers size={18} /> },
                    { label: "Most Recent", value: allAssets[0] ? formatDate(allAssets[0].datePurchased) : "—", hint: allAssets[0]?.description.slice(0, 28) ?? "—", accent: "var(--cl-orange)", icon: <Boxes size={18} /> },
                ]} />
                <ListToolbar search={search} setSearch={(s) => { setSearch(s); setPage(1); }} placeholder="Search assets…"
                    action={<Button icon={<Plus size={16} />} onClick={() => { setEditing(null); setPanelOpen(true); }}>New Asset</Button>}
                />
                <PageCard>
                    <ProgressBar active={refetching && !initialLoading} />
                    {initialLoading ? <TableShimmer columns={6} rows={8} /> :
                        error ? <EmptyState tone="danger" icon={<WifiOff size={36} strokeWidth={1.6} />} title="Could not load assets" body={error} action={{ label: "Try Again", onClick: () => setData(null) }} /> :
                            !data || data.items.length === 0 ? <EmptyState icon={<Boxes size={36} strokeWidth={1.6} />} title={debounced ? "No results found" : "No assets recorded"} body={debounced ? "No assets matched your search. Try a different keyword." : "Assets you create will appear here."} /> :
                                <DataTable<Asset>
                                    rowKey={(a) => a.id}
                                    onRowClick={(a) => router.push(`/transactions/assets/${a.id}`)}
                                    rows={data.items}
                                    columns={[
                                        { key: "created", header: "Date Created", width: 140, cell: (a) => <span className="mono text-[var(--cl-text-muted)]">{formatDate(a.dateCreated)}</span> },
                                        { key: "desc", header: "Description", cell: (a) => <span className="truncate block max-w-[28ch]" title={a.description}>{a.description}</span> },
                                        { key: "cost", header: "Cost", width: 160, align: "right", cell: (a) => <span className="mono">₦{formatNaira(a.cost)}</span> },
                                        { key: "purchased", header: "Date Purchased", width: 150, cell: (a) => <span className="mono text-[var(--cl-text-muted)]">{formatDate(a.datePurchased)}</span> },
                                        { key: "cls", header: "Classification", width: 180, cell: (a) => <Tag>{getClassification(a.classificationId)?.name ?? "—"}</Tag> },
                                        { key: "remarks", header: "Remarks", width: 200, cell: (a) => <span className="text-[var(--cl-text-muted)] truncate block max-w-[24ch]">{a.remarks || "—"}</span> },
                                    ]}
                                />
                    }
                </PageCard>
                {data && data.items.length > 0 && (
                    <PaginationBar total={data.total} page={data.page} totalPages={data.totalPages} label="assets" onPageChange={setPage} />
                )}
                <AssetFormPanel open={panelOpen} mode={editing ? "edit" : "create"} initial={editing} onClose={() => setPanelOpen(false)} onSaved={() => setPanelOpen(false)} />
            </div>
        </>
    );
}

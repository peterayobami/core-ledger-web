import * as React from "react";
import { useRouter } from "next/router";
import { Package, Coins, Calendar, Layers, TrendingDown, WifiOff, Phone } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DetailHeader, DetailGrid, DetailMain, DetailSide, Section, FieldRow, FieldsGrid } from "@/components/cl/DetailLayout";
import { KpiStrip } from "@/components/cl/KpiStrip";
import { Tag } from "@/components/cl/Tag";
import { Avatar } from "@/components/cl/Avatar";
import { RightPanelShimmer, ProgressBar } from "@/components/cl/Shimmer";
import { EmptyState } from "@/components/cl/EmptyError";
import { ConfirmDialog } from "@/components/cl/ConfirmDialog";
import { api, getClassification, getVendor, useStoreVersion } from "@/data/store";
import type { Asset, DepreciationEntry } from "@/data/types";
import { formatDate, formatNaira } from "@/lib/format";
import { AssetFormPanel } from "@/features/assets/AssetFormPanel";

export default function AssetDetailPage() {
    const router = useRouter();
    const id = router.query.id as string;
    const version = useStoreVersion();

    const [asset, setAsset] = React.useState<Asset | null>(null);
    const [schedule, setSchedule] = React.useState<DepreciationEntry[] | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState(false);
    const [confirming, setConfirming] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true); setError(null);
        api.getAsset(id)
            .then(async (a) => {
                if (cancelled) return;
                setAsset(a);
                const sched = await api.getDepreciation(a);
                if (!cancelled) setSchedule(sched);
            })
            .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load asset."); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, version]);

    if (loading || !id) {
        return (<><TopBar title="Asset" breadcrumbs={["Transactions", "Assets", "Loading…"]} /><div className="px-7 py-6"><ProgressBar active /><div className="mt-6"><RightPanelShimmer /></div></div></>);
    }
    if (error || !asset) {
        return (<><TopBar title="Asset" breadcrumbs={["Transactions", "Assets", "Error"]} /><div className="px-7 py-6"><EmptyState tone="danger" icon={<WifiOff size={36} strokeWidth={1.6} />} title="Asset not available" body={error ?? "We couldn't find this asset."} action={{ label: "Back to Assets", onClick: () => router.push("/transactions/assets") }} /></div></>);
    }

    const cls = getClassification(asset.classificationId);
    const vendor = getVendor(asset.vendorId);
    const annualDep = schedule?.[0]?.depreciation ?? 0;
    const accumulated = schedule?.[schedule.length - 1]?.cumulativeDepreciation ?? 0;
    const carrying = schedule?.[0]?.carryingValue ?? asset.cost;
    const lifeYears = schedule?.length ?? 0;

    return (
        <>
            <TopBar title={asset.description} breadcrumbs={["Transactions", "Assets", asset.description]} />
            <div className="px-7 py-6">
                <DetailHeader backTo="/transactions/assets" backLabel="Assets" eyebrow="Asset" title={asset.description}
                    subtitle={`Acquired ${formatDate(asset.datePurchased)} · ${cls?.name ?? "—"}`}
                    icon={<Package size={22} />} accent="yellow" onEdit={() => setEditing(true)} onDelete={() => setConfirming(true)} />
                <KpiStrip items={[
                    { label: "Acquisition Cost", value: `₦${formatNaira(asset.cost, { decimals: 0 })}`, hint: "Original purchase value", accent: "var(--cl-primary)", icon: <Coins size={18} /> },
                    { label: "Carrying Value", value: `₦${formatNaira(carrying, { decimals: 0 })}`, hint: "After Year 1 depreciation", accent: "var(--cl-success-variant)", icon: <TrendingDown size={18} /> },
                    { label: "Annual Depreciation", value: `₦${formatNaira(annualDep, { decimals: 0 })}`, hint: `${cls?.depreciationRate ?? 0}% · ${asset.depreciationMethod === "StraightLine" ? "Straight Line" : "Reducing Balance"}`, accent: "var(--cl-orange)", icon: <Layers size={18} /> },
                    { label: "Useful Life", value: `${lifeYears} yrs`, hint: "Projected schedule", accent: "var(--cl-skyblue)", icon: <Calendar size={18} /> },
                ]} />
                <DetailGrid>
                    <DetailMain>
                        <Section title="Asset Information">
                            <FieldsGrid cols={2}>
                                <FieldRow label="Description" span={2}>{asset.description}</FieldRow>
                                <FieldRow label="Cost" mono>₦{formatNaira(asset.cost)}</FieldRow>
                                <FieldRow label="Date Purchased" mono>{formatDate(asset.datePurchased)}</FieldRow>
                                <FieldRow label="Classification"><Tag tone="primary">{cls?.name ?? "—"}</Tag></FieldRow>
                                <FieldRow label="Depreciation Method">{asset.depreciationMethod === "StraightLine" ? "Straight Line" : "Reducing Balance"}</FieldRow>
                                <FieldRow label="Depreciation Rate" mono>{cls?.depreciationRate ?? 0}%</FieldRow>
                                <FieldRow label="Annual Allowance" mono>{cls?.annualAllowanceRate ?? 0}%</FieldRow>
                                <FieldRow label="Remarks" span={2}>{asset.remarks}</FieldRow>
                            </FieldsGrid>
                        </Section>
                        <Section title="Depreciation Schedule">
                            {!schedule || schedule.length === 0 ? (
                                <p className="text-sm text-[var(--cl-text-muted)] py-4">No schedule available.</p>
                            ) : (
                                <div className="overflow-x-auto -mx-2">
                                    <table className="w-full text-sm">
                                        <thead><tr className="text-left text-[10px] uppercase tracking-wider text-[var(--cl-text-faded)]">
                                            <th className="px-3 py-2 font-medium">Year</th><th className="px-3 py-2 font-medium text-right">Depreciation</th><th className="px-3 py-2 font-medium text-right">Cumulative</th><th className="px-3 py-2 font-medium text-right">Carrying Value</th>
                                        </tr></thead>
                                        <tbody>
                                            {schedule.map((e, i) => (
                                                <tr key={e.id} className="border-t border-[var(--cl-divider)]/40">
                                                    <td className="px-3 py-2.5 mono">{e.year}</td>
                                                    <td className="px-3 py-2.5 mono text-right">₦{formatNaira(e.depreciation)}</td>
                                                    <td className="px-3 py-2.5 mono text-right text-[var(--cl-text-muted)]">₦{formatNaira(e.cumulativeDepreciation)}</td>
                                                    <td className={`px-3 py-2.5 mono text-right ${i === 0 ? "font-semibold" : ""}`}>₦{formatNaira(e.carryingValue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot><tr className="border-t border-[var(--cl-divider)]">
                                            <td className="px-3 pt-3 text-xs text-[var(--cl-text-muted)]">Total</td>
                                            <td className="px-3 pt-3 mono text-right font-semibold">₦{formatNaira(accumulated)}</td>
                                            <td colSpan={2} />
                                        </tr></tfoot>
                                    </table>
                                </div>
                            )}
                        </Section>
                    </DetailMain>
                    <DetailSide>
                        <Section title="Vendor">
                            {vendor ? (<div className="flex items-center gap-3"><Avatar name={vendor.name} variant="organization" size={42} /><div className="min-w-0"><div className="text-sm font-medium text-[var(--cl-text)] truncate">{vendor.name}</div><div className="text-xs text-[var(--cl-text-muted)] mono mt-0.5 flex items-center gap-1.5"><Phone size={11} /> {vendor.phone}</div></div></div>) : <span className="text-sm text-[var(--cl-text-faded)]">—</span>}
                        </Section>
                        <Section title="Classification">
                            <FieldsGrid cols={1}><FieldRow label="Category">{cls?.name ?? "—"}</FieldRow><FieldRow label="Description">{cls?.description}</FieldRow><FieldRow label="Depreciation Rate" mono>{cls?.depreciationRate ?? 0}% per annum</FieldRow><FieldRow label="Capital Allowance" mono>{cls?.annualAllowanceRate ?? 0}% annual</FieldRow></FieldsGrid>
                        </Section>
                        <Section title="Audit Trail">
                            <FieldsGrid cols={1}><FieldRow label="Asset ID" mono>{asset.id}</FieldRow><FieldRow label="Date Created" mono>{formatDate(asset.dateCreated)}</FieldRow></FieldsGrid>
                        </Section>
                    </DetailSide>
                </DetailGrid>
                <AssetFormPanel open={editing} mode="edit" initial={asset} onClose={() => setEditing(false)} onSaved={() => setEditing(false)} />
                <ConfirmDialog open={confirming} title="Delete this asset?" body={`"${asset.description}" will be permanently removed. This action cannot be undone.`} loading={deleting} onCancel={() => setConfirming(false)}
                    onConfirm={async () => { setDeleting(true); try { await api.deleteAsset(asset.id); router.push("/transactions/assets"); } finally { setDeleting(false); setConfirming(false); } }} />
            </div>
        </>
    );
}

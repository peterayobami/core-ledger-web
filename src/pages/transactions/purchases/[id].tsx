import * as React from "react";
import { useRouter } from "next/router";
import { ShoppingCart, Coins, Percent, FileBarChart, Receipt, WifiOff, Phone } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DetailHeader, DetailGrid, DetailMain, DetailSide, Section, FieldRow, FieldsGrid, MoneyLine } from "@/components/cl/DetailLayout";
import { KpiStrip } from "@/components/cl/KpiStrip";
import { Tag, YesNoTag } from "@/components/cl/Tag";
import { Avatar } from "@/components/cl/Avatar";
import { RightPanelShimmer, ProgressBar } from "@/components/cl/Shimmer";
import { EmptyState } from "@/components/cl/EmptyError";
import { ConfirmDialog } from "@/components/cl/ConfirmDialog";
import { api, getVendor, useStoreVersion } from "@/data/store";
import type { Purchase } from "@/data/types";
import { formatDate, formatNaira } from "@/lib/format";
import { PurchaseFormPanel } from "@/features/purchases/PurchaseFormPanel";

export default function PurchaseDetailPage() {
    const router = useRouter();
    const id = router.query.id as string;
    const version = useStoreVersion();
    const [item, setItem] = React.useState<Purchase | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState(false);
    const [confirming, setConfirming] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true); setError(null);
        api.getPurchase(id).then((p) => { if (!cancelled) setItem(p); }).catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load."); }).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, version]);

    if (loading || !id) return (<><TopBar title="Purchase" breadcrumbs={["Transactions", "Purchases", "Loading…"]} /><div className="px-7 py-6"><ProgressBar active /><div className="mt-6"><RightPanelShimmer /></div></div></>);
    if (error || !item) return (<><TopBar title="Purchase" breadcrumbs={["Transactions", "Purchases", "Error"]} /><div className="px-7 py-6"><EmptyState tone="danger" icon={<WifiOff size={36} strokeWidth={1.6} />} title="Purchase not available" body={error ?? "Not found."} action={{ label: "Back to Purchases", onClick: () => router.push("/transactions/purchases") }} /></div></>);

    const vendor = getVendor(item.vendorId);
    const netPayable = item.cost + item.vatAmount - item.whtAmount;

    return (
        <>
            <TopBar title={item.description} breadcrumbs={["Transactions", "Purchases", item.description]} />
            <div className="px-7 py-6">
                <DetailHeader backTo="/transactions/purchases" backLabel="Purchases" eyebrow="Purchase Invoice" title={item.description} subtitle={`${item.invoiceNumber} · ${formatDate(item.datePurchased)}`} icon={<ShoppingCart size={22} />} accent="skyblue" onEdit={() => setEditing(true)} onDelete={() => setConfirming(true)} />
                <KpiStrip items={[
                    { label: "Invoice Cost", value: `₦${formatNaira(item.cost, { decimals: 0 })}`, hint: "Net of taxes", accent: "var(--cl-skyblue)", icon: <Coins size={18} /> },
                    { label: "VAT (Input)", value: `₦${formatNaira(item.vatAmount, { decimals: 0 })}`, hint: item.isVatApplicable ? "7.5% recoverable" : "Not applicable", accent: "var(--cl-success-variant)", icon: <Percent size={18} /> },
                    { label: "WHT Withheld", value: `₦${formatNaira(item.whtAmount, { decimals: 0 })}`, hint: item.isWhtApplicable ? `${item.whtRate}% remittable` : "Not applicable", accent: "var(--cl-orange)", icon: <FileBarChart size={18} /> },
                    { label: "Net Payable", value: `₦${formatNaira(netPayable, { decimals: 0 })}`, hint: "Cost + VAT − WHT", accent: "var(--cl-primary)", icon: <Receipt size={18} /> },
                ]} />
                <DetailGrid>
                    <DetailMain>
                        <Section title="Invoice Details"><FieldsGrid cols={2}><FieldRow label="Description" span={2}>{item.description}</FieldRow><FieldRow label="Invoice Number" mono>{item.invoiceNumber}</FieldRow><FieldRow label="Date Purchased" mono>{formatDate(item.datePurchased)}</FieldRow><FieldRow label="Cost" mono>₦{formatNaira(item.cost)}</FieldRow><FieldRow label="VAT Applicable"><YesNoTag value={item.isVatApplicable} /></FieldRow><FieldRow label="WHT Applicable">{item.isWhtApplicable ? <Tag tone="orange">{item.whtRate}%</Tag> : <YesNoTag value={false} />}</FieldRow><FieldRow label="WHT Rate" mono>{item.whtRate}%</FieldRow><FieldRow label="Remarks" span={2}>{item.remarks}</FieldRow></FieldsGrid></Section>
                        <Section title="Tax Breakdown"><div className="divide-y divide-[var(--cl-divider)]/50"><MoneyLine label="Net Cost" value={item.cost} /><MoneyLine label={`VAT @ 7.5%${item.isVatApplicable ? "" : " (n/a)"}`} value={item.vatAmount} tone="success" /><MoneyLine label="Gross Invoice" value={item.cost + item.vatAmount} /><MoneyLine label={`WHT @ ${item.whtRate}%${item.isWhtApplicable ? "" : " (n/a)"}`} value={-item.whtAmount} tone="danger" /><MoneyLine label="Net Payable to Vendor" value={netPayable} emphasis tone="primary" /></div></Section>
                    </DetailMain>
                    <DetailSide>
                        <Section title="Vendor">{vendor ? (<div className="flex items-center gap-3"><Avatar name={vendor.name} variant="organization" size={42} /><div className="min-w-0"><div className="text-sm font-medium text-[var(--cl-text)] truncate">{vendor.name}</div><div className="text-xs text-[var(--cl-text-muted)] mono mt-0.5 flex items-center gap-1.5"><Phone size={11} /> {vendor.phone}</div></div></div>) : <span className="text-sm text-[var(--cl-text-faded)]">—</span>}</Section>
                        <Section title="Compliance"><FieldsGrid cols={1}><FieldRow label="VAT Status">{item.isVatApplicable ? "Recoverable input VAT" : "Out of scope"}</FieldRow><FieldRow label="WHT Status">{item.isWhtApplicable ? `Withhold ${item.whtRate}% on payment` : "No withholding required"}</FieldRow><FieldRow label="WHT Liability" mono>₦{formatNaira(item.whtAmount)}</FieldRow></FieldsGrid></Section>
                        <Section title="Audit Trail"><FieldsGrid cols={1}><FieldRow label="Record ID" mono>{item.id}</FieldRow><FieldRow label="Date Created" mono>{formatDate(item.dateCreated)}</FieldRow></FieldsGrid></Section>
                    </DetailSide>
                </DetailGrid>
                <PurchaseFormPanel open={editing} mode="edit" initial={item} onClose={() => setEditing(false)} onSaved={() => setEditing(false)} />
                <ConfirmDialog open={confirming} title="Delete this purchase?" body={`Invoice ${item.invoiceNumber} will be permanently removed.`} loading={deleting} onCancel={() => setConfirming(false)}
                    onConfirm={async () => { setDeleting(true); try { await api.deletePurchase(item.id); router.push("/transactions/purchases"); } finally { setDeleting(false); setConfirming(false); } }} />
            </div>
        </>
    );
}

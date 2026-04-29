import * as React from "react";
import { useRouter } from "next/router";
import { TrendingUp, Coins, Percent, FileBarChart, Receipt, WifiOff, Mail, Phone } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DetailHeader, DetailGrid, DetailMain, DetailSide, Section, FieldRow, FieldsGrid, MoneyLine } from "@/components/cl/DetailLayout";
import { KpiStrip } from "@/components/cl/KpiStrip";
import { Tag, YesNoTag, CustomerTypeTag } from "@/components/cl/Tag";
import { Avatar } from "@/components/cl/Avatar";
import { RightPanelShimmer, ProgressBar } from "@/components/cl/Shimmer";
import { EmptyState } from "@/components/cl/EmptyError";
import { ConfirmDialog } from "@/components/cl/ConfirmDialog";
import { api, getCustomer, getRevenueCategory, useStoreVersion } from "@/data/store";
import type { Revenue } from "@/data/types";
import { formatDate, formatNaira } from "@/lib/format";
import { RevenueFormPanel } from "@/features/revenue/RevenueFormPanel";

export default function RevenueDetailPage() {
    const router = useRouter();
    const id = router.query.id as string;
    const version = useStoreVersion();
    const [item, setItem] = React.useState<Revenue | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState(false);
    const [confirming, setConfirming] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true); setError(null);
        api.getRevenue(id).then((r) => { if (!cancelled) setItem(r); }).catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load."); }).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, version]);

    if (loading || !id) return (<><TopBar title="Revenue" breadcrumbs={["Transactions", "Revenue", "Loading…"]} /><div className="px-7 py-6"><ProgressBar active /><div className="mt-6"><RightPanelShimmer /></div></div></>);
    if (error || !item) return (<><TopBar title="Revenue" breadcrumbs={["Transactions", "Revenue", "Error"]} /><div className="px-7 py-6"><EmptyState tone="danger" icon={<WifiOff size={36} strokeWidth={1.6} />} title="Revenue not available" body={error ?? "Not found."} action={{ label: "Back to Revenue", onClick: () => router.push("/transactions/revenue") }} /></div></>);

    const customer = getCustomer(item.customerId);
    const category = getRevenueCategory(item.categoryId);
    const grossInvoice = item.salesAmount + item.vatAmount;
    const netReceivable = grossInvoice - item.whtAmount;

    return (
        <>
            <TopBar title={item.description} breadcrumbs={["Transactions", "Revenue", item.description]} />
            <div className="px-7 py-6">
                <DetailHeader backTo="/transactions/revenue" backLabel="Revenue" eyebrow="Sales Invoice" title={item.description} subtitle={`${item.invoiceNumber} · ${formatDate(item.date)}`} icon={<TrendingUp size={22} />} accent="success" onEdit={() => setEditing(true)} onDelete={() => setConfirming(true)} />
                <KpiStrip items={[
                    { label: "Sales Amount", value: `₦${formatNaira(item.salesAmount, { decimals: 0 })}`, hint: "Net of VAT", accent: "var(--cl-success-variant)", icon: <Coins size={18} /> },
                    { label: "VAT (Output)", value: `₦${formatNaira(item.vatAmount, { decimals: 0 })}`, hint: item.isTaxableSupply ? "7.5% payable" : "Exempt", accent: "var(--cl-primary)", icon: <Percent size={18} /> },
                    { label: "WHT Credit", value: `₦${formatNaira(item.whtAmount, { decimals: 0 })}`, hint: item.isWhtApplicable ? `${item.whtRate}% withheld` : "Not applicable", accent: "var(--cl-orange)", icon: <FileBarChart size={18} /> },
                    { label: "Net Receivable", value: `₦${formatNaira(netReceivable, { decimals: 0 })}`, hint: "After WHT credit", accent: "var(--cl-skyblue)", icon: <Receipt size={18} /> },
                ]} />
                <DetailGrid>
                    <DetailMain>
                        <Section title="Invoice Details"><FieldsGrid cols={2}><FieldRow label="Description" span={2}>{item.description}</FieldRow><FieldRow label="Invoice Number" mono>{item.invoiceNumber}</FieldRow><FieldRow label="Invoice Date" mono>{formatDate(item.date)}</FieldRow><FieldRow label="Sales Amount" mono>₦{formatNaira(item.salesAmount)}</FieldRow><FieldRow label="Revenue Category">{category ? <Tag tone="skyblue">{category.name}</Tag> : "—"}</FieldRow><FieldRow label="Taxable Supply"><YesNoTag value={item.isTaxableSupply} /></FieldRow><FieldRow label="WHT Applicable">{item.isWhtApplicable ? <Tag tone="orange">{item.whtRate}%</Tag> : <YesNoTag value={false} />}</FieldRow><FieldRow label="WHT Certificate #" mono span={2}>{item.whtCertificateNumber}</FieldRow><FieldRow label="Remarks" span={2}>{item.remarks}</FieldRow></FieldsGrid></Section>
                        <Section title="Revenue Breakdown"><div className="divide-y divide-[var(--cl-divider)]/50"><MoneyLine label="Sales Amount" value={item.salesAmount} /><MoneyLine label={`Output VAT @ 7.5%${item.isTaxableSupply ? "" : " (exempt)"}`} value={item.vatAmount} tone="primary" /><MoneyLine label="Gross Invoice" value={grossInvoice} /><MoneyLine label={`WHT Credit @ ${item.whtRate}%${item.isWhtApplicable ? "" : " (n/a)"}`} value={-item.whtAmount} tone="danger" /><MoneyLine label="Net Receivable" value={netReceivable} emphasis tone="success" /></div></Section>
                    </DetailMain>
                    <DetailSide>
                        <Section title="Customer">{customer ? (<div><div className="flex items-center gap-3"><Avatar name={customer.name} variant={customer.type === "Individual" ? "individual" : "organization"} size={42} /><div className="min-w-0 flex-1"><div className="text-sm font-medium text-[var(--cl-text)] truncate">{customer.name}</div><div className="mt-0.5"><CustomerTypeTag type={customer.type} /></div></div></div><div className="mt-3 space-y-1.5 text-xs text-[var(--cl-text-muted)] mono">{customer.email && <div className="flex items-center gap-1.5"><Mail size={11} /> {customer.email}</div>}{customer.phone && <div className="flex items-center gap-1.5"><Phone size={11} /> {customer.phone}</div>}</div></div>) : <span className="text-sm text-[var(--cl-text-faded)]">—</span>}</Section>
                        <Section title="Compliance"><FieldsGrid cols={1}><FieldRow label="VAT Status">{item.isTaxableSupply ? "Standard rated supply" : "Exempt or zero-rated"}</FieldRow><FieldRow label="WHT Status">{item.isWhtApplicable ? `Customer withholding ${item.whtRate}%` : "No WHT"}</FieldRow><FieldRow label="WHT Credit" mono>₦{formatNaira(item.whtAmount)}</FieldRow></FieldsGrid></Section>
                        <Section title="Audit Trail"><FieldsGrid cols={1}><FieldRow label="Record ID" mono>{item.id}</FieldRow><FieldRow label="Date Created" mono>{formatDate(item.dateCreated)}</FieldRow></FieldsGrid></Section>
                    </DetailSide>
                </DetailGrid>
                <RevenueFormPanel open={editing} mode="edit" initial={item} onClose={() => setEditing(false)} onSaved={() => setEditing(false)} />
                <ConfirmDialog open={confirming} title="Delete this revenue entry?" body={`Invoice ${item.invoiceNumber} will be permanently removed.`} loading={deleting} onCancel={() => setConfirming(false)}
                    onConfirm={async () => { setDeleting(true); try { await api.deleteRevenue(item.id); router.push("/transactions/revenue"); } finally { setDeleting(false); setConfirming(false); } }} />
            </div>
        </>
    );
}

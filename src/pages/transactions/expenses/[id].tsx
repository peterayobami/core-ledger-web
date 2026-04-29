import * as React from "react";
import { useRouter } from "next/router";
import { Receipt, Coins, Percent, FileBarChart, ShieldOff, ShieldCheck, WifiOff, Phone } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DetailHeader, DetailGrid, DetailMain, DetailSide, Section, FieldRow, FieldsGrid, MoneyLine } from "@/components/cl/DetailLayout";
import { KpiStrip } from "@/components/cl/KpiStrip";
import { Tag, YesNoTag } from "@/components/cl/Tag";
import { Avatar } from "@/components/cl/Avatar";
import { RightPanelShimmer, ProgressBar } from "@/components/cl/Shimmer";
import { EmptyState } from "@/components/cl/EmptyError";
import { ConfirmDialog } from "@/components/cl/ConfirmDialog";
import { api, getVendor, getExpenseCategory, useStoreVersion } from "@/data/store";
import type { Expense } from "@/data/types";
import { formatDate, formatNaira } from "@/lib/format";
import { ExpenseFormPanel } from "@/features/expenses/ExpenseFormPanel";

export default function ExpenseDetailPage() {
    const router = useRouter();
    const id = router.query.id as string;
    const version = useStoreVersion();
    const [item, setItem] = React.useState<Expense | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState(false);
    const [confirming, setConfirming] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true); setError(null);
        api.getExpense(id).then((e) => { if (!cancelled) setItem(e); }).catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load."); }).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, version]);

    if (loading || !id) return (<><TopBar title="Expense" breadcrumbs={["Transactions", "Expenses", "Loading…"]} /><div className="px-7 py-6"><ProgressBar active /><div className="mt-6"><RightPanelShimmer /></div></div></>);
    if (error || !item) return (<><TopBar title="Expense" breadcrumbs={["Transactions", "Expenses", "Error"]} /><div className="px-7 py-6"><EmptyState tone="danger" icon={<WifiOff size={36} strokeWidth={1.6} />} title="Expense not available" body={error ?? "Not found."} action={{ label: "Back to Expenses", onClick: () => router.push("/transactions/expenses") }} /></div></>);

    const supplier = getVendor(item.supplierId);
    const category = getExpenseCategory(item.categoryId);
    const netPayable = item.cost + item.vatAmount - item.whtAmount;

    return (
        <>
            <TopBar title={item.description} breadcrumbs={["Transactions", "Expenses", item.description]} />
            <div className="px-7 py-6">
                <DetailHeader backTo="/transactions/expenses" backLabel="Expenses" eyebrow="Expense Entry" title={item.description} subtitle={`${item.invoiceNumber} · ${formatDate(item.date)}`} icon={<Receipt size={22} />} accent="orange" onEdit={() => setEditing(true)} onDelete={() => setConfirming(true)} />
                <KpiStrip items={[
                    { label: "Expense Cost", value: `₦${formatNaira(item.cost, { decimals: 0 })}`, hint: "Net of taxes", accent: "var(--cl-orange)", icon: <Coins size={18} /> },
                    { label: "VAT (Input)", value: `₦${formatNaira(item.vatAmount, { decimals: 0 })}`, hint: item.isVatApplicable ? "7.5%" : "Not applicable", accent: "var(--cl-success-variant)", icon: <Percent size={18} /> },
                    { label: "Tax Treatment", value: item.isTaxDeductible ? "Deductible" : "Add-back", hint: item.isTaxDeductible ? "Allowable for CIT" : "Disallowed", accent: item.isTaxDeductible ? "var(--cl-success-variant)" : "var(--cl-danger)", icon: item.isTaxDeductible ? <ShieldCheck size={18} /> : <ShieldOff size={18} /> },
                    { label: "Net Payable", value: `₦${formatNaira(netPayable, { decimals: 0 })}`, hint: "Cost + VAT − WHT", accent: "var(--cl-primary)", icon: <FileBarChart size={18} /> },
                ]} />
                <DetailGrid>
                    <DetailMain>
                        <Section title="Expense Details"><FieldsGrid cols={2}><FieldRow label="Description" span={2}>{item.description}</FieldRow><FieldRow label="Invoice Number" mono>{item.invoiceNumber}</FieldRow><FieldRow label="Date" mono>{formatDate(item.date)}</FieldRow><FieldRow label="Cost" mono>₦{formatNaira(item.cost)}</FieldRow><FieldRow label="Category">{category ? <Tag tone="orange">{category.name}</Tag> : "—"}</FieldRow><FieldRow label="VAT Applicable"><YesNoTag value={item.isVatApplicable} /></FieldRow><FieldRow label="WHT Applicable">{item.isWhtApplicable ? <Tag tone="orange">{item.whtRate}%</Tag> : <YesNoTag value={false} />}</FieldRow><FieldRow label="Tax Deductible"><YesNoTag value={item.isTaxDeductible} /></FieldRow>{!item.isTaxDeductible && (<FieldRow label="Non-Deductible Reason" span={2}>{item.nonDeductibleReason}</FieldRow>)}<FieldRow label="Remarks" span={2}>{item.remarks}</FieldRow></FieldsGrid></Section>
                        <Section title="Tax Breakdown"><div className="divide-y divide-[var(--cl-divider)]/50"><MoneyLine label="Net Cost" value={item.cost} /><MoneyLine label={`VAT @ 7.5%${item.isVatApplicable ? "" : " (n/a)"}`} value={item.vatAmount} tone="success" /><MoneyLine label="Gross Invoice" value={item.cost + item.vatAmount} /><MoneyLine label={`WHT @ ${item.whtRate}%${item.isWhtApplicable ? "" : " (n/a)"}`} value={-item.whtAmount} tone="danger" /><MoneyLine label="Net Payable to Supplier" value={netPayable} emphasis tone="primary" /></div></Section>
                    </DetailMain>
                    <DetailSide>
                        <Section title="Supplier">{supplier ? (<div className="flex items-center gap-3"><Avatar name={supplier.name} variant="organization" size={42} /><div className="min-w-0"><div className="text-sm font-medium text-[var(--cl-text)] truncate">{supplier.name}</div><div className="text-xs text-[var(--cl-text-muted)] mono mt-0.5 flex items-center gap-1.5"><Phone size={11} /> {supplier.phone}</div></div></div>) : <span className="text-sm text-[var(--cl-text-faded)]">—</span>}</Section>
                        <Section title="Tax Treatment"><FieldsGrid cols={1}><FieldRow label="Deductibility">{item.isTaxDeductible ? <Tag tone="success">Allowable for CIT</Tag> : <Tag tone="danger">Disallowed — add-back</Tag>}</FieldRow>{!item.isTaxDeductible && (<FieldRow label="Reason">{item.nonDeductibleReason}</FieldRow>)}<FieldRow label="VAT Recoverable" mono>₦{formatNaira(item.vatAmount)}</FieldRow><FieldRow label="WHT Liability" mono>₦{formatNaira(item.whtAmount)}</FieldRow></FieldsGrid></Section>
                        <Section title="Audit Trail"><FieldsGrid cols={1}><FieldRow label="Record ID" mono>{item.id}</FieldRow><FieldRow label="Date Created" mono>{formatDate(item.dateCreated)}</FieldRow></FieldsGrid></Section>
                    </DetailSide>
                </DetailGrid>
                <ExpenseFormPanel open={editing} mode="edit" initial={item} onClose={() => setEditing(false)} onSaved={() => setEditing(false)} />
                <ConfirmDialog open={confirming} title="Delete this expense?" body={`${item.invoiceNumber} will be permanently removed.`} loading={deleting} onCancel={() => setConfirming(false)}
                    onConfirm={async () => { setDeleting(true); try { await api.deleteExpense(item.id); router.push("/transactions/expenses"); } finally { setDeleting(false); setConfirming(false); } }} />
            </div>
        </>
    );
}

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { SlidePanel } from "@/components/cl/SlidePanel";
import { Button } from "@/components/cl/Button";
import { Field, TextInput, TextArea, CurrencyInput, DateField, ServerErrorBanner, CollapseField } from "@/components/cl/Field";
import { ChipSelector } from "@/components/cl/Chip";
import { SelectorTrigger, CustomerPicker } from "@/components/cl/SelectorPicker";
import { api, getCustomer, revenueCategories } from "@/data/store";
import type { Customer, Revenue } from "@/data/types";
import { formatNaira } from "@/lib/format";
import { COA_ACCOUNTS } from "@/lib/services/ledger.service";

// 🔌 BACKEND: Revenue account options come from GET /api/accounts?type=Revenue.
// coaAccountCode is sent with POST /revenues so the backend journal service
// knows which account to credit: Dr 1200 Accounts Receivable / Cr {coaAccountCode}.
const revenueAccounts = COA_ACCOUNTS.filter(a => a.type === "Revenue" && a.isActive && !a.code.endsWith("000"));

interface Props { open: boolean; mode: "create" | "edit"; initial?: Revenue | null; onClose: () => void; onSaved: (r: Revenue) => void; }
interface FS { description: string; invoiceNumber: string; salesAmount: number; date: string; isTaxableSupply: boolean; customer: Customer | null; categoryId: string | null; coaAccountCode: string | null; isWhtApplicable: boolean; whtRate: number; whtCertificateNumber: string; remarks: string; }
const empty = (): FS => ({ description: "", invoiceNumber: "", salesAmount: 0, date: "", isTaxableSupply: false, customer: null, categoryId: null, coaAccountCode: null, isWhtApplicable: false, whtRate: 0, whtCertificateNumber: "", remarks: "" });

export function RevenueFormPanel({ open, mode, initial, onClose, onSaved }: Props) {
    const [s, setS] = React.useState<FS>(empty());
    const [submitted, setSubmitted] = React.useState(false);
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [pickerOpen, setPickerOpen] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        setSubmitted(false); setServerError(null); setSaving(false);
        if (mode === "edit" && initial) {
            setS({ description: initial.description, invoiceNumber: initial.invoiceNumber, salesAmount: initial.salesAmount, date: initial.date, isTaxableSupply: initial.isTaxableSupply, customer: getCustomer(initial.customerId) ?? null, categoryId: initial.categoryId ?? null, coaAccountCode: initial.coaAccountCode ?? null, isWhtApplicable: initial.isWhtApplicable, whtRate: initial.whtRate, whtCertificateNumber: initial.whtCertificateNumber ?? "", remarks: initial.remarks ?? "" });
        } else setS(empty());
    }, [open, mode, initial]);

    const update = <K extends keyof FS>(k: K, v: FS[K]) => setS((p) => ({ ...p, [k]: v }));

    const errors = React.useMemo(() => {
        if (!submitted) return {} as Record<string, string>;
        const e: Record<string, string> = {};
        if (!s.description.trim()) e.description = "Description is required.";
        if (!s.invoiceNumber.trim()) e.invoiceNumber = "Invoice number is required.";
        if (!s.salesAmount || s.salesAmount <= 0) e.salesAmount = "Amount must be greater than 0.";
        if (!s.customer) e.customer = "Please select a customer.";
        if (!s.date) e.date = "Date is required.";
        else if (new Date(s.date) > new Date()) e.date = "Date cannot be in the future.";
        if (s.isWhtApplicable && !s.whtRate) e.whtRate = "Select a WHT rate.";
        return e;
    }, [submitted, s]);

    const vatPreview = s.isTaxableSupply ? s.salesAmount * 0.075 : 0;
    const whtPreview = s.isWhtApplicable ? s.salesAmount * (s.whtRate / 100) : 0;

    async function handleSubmit() {
        setSubmitted(true); setServerError(null);
        if (!s.description.trim() || !s.invoiceNumber.trim() || !s.salesAmount || !s.customer || !s.date) return;
        if (s.isWhtApplicable && !s.whtRate) return;
        setSaving(true);
        try {
            const payload = { description: s.description.trim(), invoiceNumber: s.invoiceNumber.trim(), salesAmount: s.salesAmount, date: new Date(s.date).toISOString(), isTaxableSupply: s.isTaxableSupply, customerId: s.customer!.id, categoryId: s.categoryId, coaAccountCode: s.coaAccountCode ?? undefined, isWhtApplicable: s.isWhtApplicable, whtRate: s.whtRate, whtCertificateNumber: s.whtCertificateNumber.trim() || undefined, remarks: s.remarks.trim() || undefined };
            const result = mode === "create" ? await api.createRevenue(payload) : await api.updateRevenue(initial!.id, payload);
            onSaved(result);
        } catch (err) { setServerError(err instanceof Error ? err.message : "Could not save revenue."); }
        finally { setSaving(false); }
    }

    const today = new Date().toISOString().slice(0, 10);
    const isEdit = mode === "edit";

    return (
        <>
            <SlidePanel open={open} onClose={onClose} title={isEdit ? "Edit Revenue" : "New Revenue"} icon={<TrendingUp size={18} />}
                footer={<><Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} loading={saving}>{isEdit ? "Save Changes" : "Save Revenue"}</Button></>}
            >
                <div className="space-y-5">
                    <ServerErrorBanner message={serverError} />
                    <Field label="Description" required error={errors.description}><TextInput value={s.description} onChange={(e) => update("description", e.target.value)} placeholder="e.g. Consulting Services" error={!!errors.description} disabled={saving} /></Field>
                    <Field label="Invoice Number" required error={errors.invoiceNumber}><TextInput value={s.invoiceNumber} onChange={(e) => update("invoiceNumber", e.target.value)} placeholder="INV-OUT-2025-0001" mono error={!!errors.invoiceNumber} disabled={saving} /></Field>
                    <Field label="Sales Amount (₦)" required error={errors.salesAmount}><CurrencyInput value={s.salesAmount} onChange={(v) => update("salesAmount", v)} placeholder="e.g. 2,500,000" error={!!errors.salesAmount} disabled={saving} /></Field>
                    <Field label="Customer" required error={errors.customer}><SelectorTrigger value={s.customer?.name ?? ""} placeholder="Select customer…" onClick={() => setPickerOpen(true)} error={!!errors.customer} /></Field>
                    <Field label="Revenue Category"><ChipSelector options={revenueCategories.map((c) => ({ value: c.id, label: c.name }))} value={s.categoryId} onChange={(v) => update("categoryId", v)} layout="wrap" disabled={saving} /></Field>
                    <Field label="Revenue Account (GL)" hint="Credit side of the journal entry">
                        <select value={s.coaAccountCode ?? ""} onChange={(e) => update("coaAccountCode", e.target.value || null)} disabled={saving} className="w-full rounded-md border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--cl-primary)]">
                            <option value="">Select account…</option>
                            {revenueAccounts.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Date" required error={errors.date}><DateField value={s.date} onChange={(v) => update("date", v)} max={today} error={!!errors.date} disabled={saving} /></Field>
                    <Field label="Taxable Supply (VAT)">
                        <ChipSelector options={[{ value: "yes", label: "Yes (7.5%)", accent: "success" as const }, { value: "no", label: "No", accent: "danger" as const }]} value={s.isTaxableSupply ? "yes" : "no"} onChange={(v) => update("isTaxableSupply", v === "yes")} layout="inline-2" disabled={saving} />
                        <CollapseField open={s.isTaxableSupply && s.salesAmount > 0}><p className="text-xs text-[var(--cl-text-muted)]">Computed VAT: <span className="mono text-[var(--cl-text)]">₦{formatNaira(vatPreview)}</span></p></CollapseField>
                    </Field>
                    <Field label="WHT Applicable">
                        <ChipSelector options={[{ value: "yes", label: "Yes", accent: "success" as const }, { value: "no", label: "No", accent: "danger" as const }]} value={s.isWhtApplicable ? "yes" : "no"} onChange={(v) => { update("isWhtApplicable", v === "yes"); if (v === "no") { update("whtRate", 0); update("whtCertificateNumber", ""); } }} layout="inline-2" disabled={saving} />
                        <CollapseField open={s.isWhtApplicable}>
                            <Field label="WHT Rate" required error={errors.whtRate}><ChipSelector options={[{ value: 5, label: "5%" }, { value: 10, label: "10%" }]} value={s.whtRate || null} onChange={(v) => update("whtRate", v as number)} layout="inline-2" disabled={saving} /></Field>
                            {s.salesAmount > 0 && s.whtRate > 0 && (<p className="mt-2 text-xs text-[var(--cl-text-muted)]">Computed WHT: <span className="mono text-[var(--cl-text)]">₦{formatNaira(whtPreview)}</span></p>)}
                            <div className="mt-3"><Field label="WHT Certificate Number"><TextInput value={s.whtCertificateNumber} onChange={(e) => update("whtCertificateNumber", e.target.value)} placeholder="WHT-2025-0001" mono disabled={saving} /></Field></div>
                        </CollapseField>
                    </Field>
                    <Field label="Remarks"><TextArea value={s.remarks} onChange={(e) => update("remarks", e.target.value)} placeholder="Optional notes" rows={3} disabled={saving} /></Field>
                </div>
            </SlidePanel>
            <CustomerPicker open={pickerOpen} onClose={() => { setPickerOpen(false); onClose(); }} onBack={() => setPickerOpen(false)} selectedId={s.customer?.id ?? null} onSelect={(c) => { update("customer", c); setPickerOpen(false); }} />
        </>
    );
}

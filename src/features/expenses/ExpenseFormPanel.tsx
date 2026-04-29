import * as React from "react";
import { Receipt } from "lucide-react";
import { SlidePanel } from "@/components/cl/SlidePanel";
import { Button } from "@/components/cl/Button";
import { Field, TextInput, TextArea, CurrencyInput, DateField, ServerErrorBanner, CollapseField } from "@/components/cl/Field";
import { ChipSelector } from "@/components/cl/Chip";
import { SelectorTrigger, VendorPicker } from "@/components/cl/SelectorPicker";
import { api, getVendor, expenseCategories } from "@/data/store";
import type { Expense, Vendor } from "@/data/types";
import { formatNaira } from "@/lib/format";

interface Props { open: boolean; mode: "create" | "edit"; initial?: Expense | null; onClose: () => void; onSaved: (e: Expense) => void; }
interface FS { description: string; invoiceNumber: string; cost: number; date: string; isTaxDeductible: boolean; nonDeductibleReason: string; isVatApplicable: boolean; supplier: Vendor | null; categoryId: string | null; isWhtApplicable: boolean; whtRate: number; remarks: string; }
const empty = (): FS => ({ description: "", invoiceNumber: "", cost: 0, date: "", isTaxDeductible: true, nonDeductibleReason: "", isVatApplicable: false, supplier: null, categoryId: null, isWhtApplicable: false, whtRate: 0, remarks: "" });

export function ExpenseFormPanel({ open, mode, initial, onClose, onSaved }: Props) {
    const [s, setS] = React.useState<FS>(empty());
    const [submitted, setSubmitted] = React.useState(false);
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [pickerOpen, setPickerOpen] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        setSubmitted(false); setServerError(null); setSaving(false);
        if (mode === "edit" && initial) {
            setS({ description: initial.description, invoiceNumber: initial.invoiceNumber, cost: initial.cost, date: initial.date, isTaxDeductible: initial.isTaxDeductible, nonDeductibleReason: initial.nonDeductibleReason ?? "", isVatApplicable: initial.isVatApplicable, supplier: getVendor(initial.supplierId) ?? null, categoryId: initial.categoryId, isWhtApplicable: initial.isWhtApplicable, whtRate: initial.whtRate, remarks: initial.remarks ?? "" });
        } else setS(empty());
    }, [open, mode, initial]);

    const update = <K extends keyof FS>(k: K, v: FS[K]) => setS((p) => ({ ...p, [k]: v }));

    const errors = React.useMemo(() => {
        if (!submitted) return {} as Record<string, string>;
        const e: Record<string, string> = {};
        if (!s.description.trim()) e.description = "Description is required.";
        if (!s.invoiceNumber.trim()) e.invoiceNumber = "Invoice number is required.";
        if (!s.cost || s.cost <= 0) e.cost = "Cost must be greater than 0.";
        if (!s.supplier) e.supplier = "Please select a supplier.";
        if (!s.categoryId) e.categoryId = "Please select an expense category.";
        if (!s.date) e.date = "Date is required.";
        else if (new Date(s.date) > new Date()) e.date = "Date cannot be in the future.";
        if (!s.isTaxDeductible && !s.nonDeductibleReason.trim()) e.nonDeductibleReason = "Reason is required.";
        if (s.isWhtApplicable && !s.whtRate) e.whtRate = "Select a WHT rate.";
        return e;
    }, [submitted, s]);

    const vatPreview = s.isVatApplicable ? s.cost * 0.075 : 0;
    const whtPreview = s.isWhtApplicable ? s.cost * (s.whtRate / 100) : 0;

    async function handleSubmit() {
        setSubmitted(true); setServerError(null);
        if (!s.description.trim() || !s.invoiceNumber.trim() || !s.cost || !s.supplier || !s.categoryId || !s.date) return;
        if (!s.isTaxDeductible && !s.nonDeductibleReason.trim()) return;
        if (s.isWhtApplicable && !s.whtRate) return;
        setSaving(true);
        try {
            const payload = { description: s.description.trim(), invoiceNumber: s.invoiceNumber.trim(), cost: s.cost, date: new Date(s.date).toISOString(), isTaxDeductible: s.isTaxDeductible, nonDeductibleReason: s.isTaxDeductible ? undefined : s.nonDeductibleReason.trim(), isVatApplicable: s.isVatApplicable, supplierId: s.supplier!.id, categoryId: s.categoryId!, isWhtApplicable: s.isWhtApplicable, whtRate: s.whtRate, remarks: s.remarks.trim() || undefined };
            const result = mode === "create" ? await api.createExpense(payload) : await api.updateExpense(initial!.id, payload);
            onSaved(result);
        } catch (err) { setServerError(err instanceof Error ? err.message : "Could not save expense."); }
        finally { setSaving(false); }
    }

    const today = new Date().toISOString().slice(0, 10);
    const isEdit = mode === "edit";

    return (
        <>
            <SlidePanel open={open} onClose={onClose} title={isEdit ? "Edit Expense" : "New Expense"} icon={<Receipt size={18} />}
                footer={<><Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} loading={saving}>{isEdit ? "Save Changes" : "Save Expense"}</Button></>}
            >
                <div className="space-y-5">
                    <ServerErrorBanner message={serverError} />
                    <Field label="Description" required error={errors.description}><TextInput value={s.description} onChange={(e) => update("description", e.target.value)} placeholder="e.g. Office Rent" error={!!errors.description} disabled={saving} /></Field>
                    <Field label="Invoice Number" required error={errors.invoiceNumber}><TextInput value={s.invoiceNumber} onChange={(e) => update("invoiceNumber", e.target.value)} placeholder="INV-EXP-0001" mono error={!!errors.invoiceNumber} disabled={saving} /></Field>
                    <Field label="Cost (₦)" required error={errors.cost}><CurrencyInput value={s.cost} onChange={(v) => update("cost", v)} placeholder="e.g. 1,200,000" error={!!errors.cost} disabled={saving} /></Field>
                    <Field label="Supplier" required error={errors.supplier}><SelectorTrigger value={s.supplier?.name ?? ""} placeholder="Select supplier…" onClick={() => setPickerOpen(true)} error={!!errors.supplier} /></Field>
                    <Field label="Expense Category" required error={errors.categoryId}><ChipSelector options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))} value={s.categoryId} onChange={(v) => update("categoryId", v)} layout="wrap" disabled={saving} /></Field>
                    <Field label="Date" required error={errors.date}><DateField value={s.date} onChange={(v) => update("date", v)} max={today} error={!!errors.date} disabled={saving} /></Field>
                    <Field label="Tax Deductible">
                        <ChipSelector options={[{ value: "yes", label: "Yes", accent: "success" as const }, { value: "no", label: "No", accent: "danger" as const }]} value={s.isTaxDeductible ? "yes" : "no"} onChange={(v) => update("isTaxDeductible", v === "yes")} layout="inline-2" disabled={saving} />
                        <CollapseField open={!s.isTaxDeductible}><Field label="Reason for Non-Deductibility" required error={errors.nonDeductibleReason}><TextArea value={s.nonDeductibleReason} onChange={(e) => update("nonDeductibleReason", e.target.value)} rows={2} disabled={saving} placeholder="Explain why this is non-deductible" /></Field></CollapseField>
                    </Field>
                    <Field label="VAT Applicable">
                        <ChipSelector options={[{ value: "yes", label: "Yes (7.5%)", accent: "success" as const }, { value: "no", label: "No", accent: "danger" as const }]} value={s.isVatApplicable ? "yes" : "no"} onChange={(v) => update("isVatApplicable", v === "yes")} layout="inline-2" disabled={saving} />
                        <CollapseField open={s.isVatApplicable && s.cost > 0}><p className="text-xs text-[var(--cl-text-muted)]">Computed VAT: <span className="mono text-[var(--cl-text)]">₦{formatNaira(vatPreview)}</span></p></CollapseField>
                    </Field>
                    <Field label="WHT Applicable">
                        <ChipSelector options={[{ value: "yes", label: "Yes", accent: "success" as const }, { value: "no", label: "No", accent: "danger" as const }]} value={s.isWhtApplicable ? "yes" : "no"} onChange={(v) => { update("isWhtApplicable", v === "yes"); if (v === "no") update("whtRate", 0); }} layout="inline-2" disabled={saving} />
                        <CollapseField open={s.isWhtApplicable}>
                            <Field label="WHT Rate" required error={errors.whtRate}><ChipSelector options={[{ value: 5, label: "5%" }, { value: 10, label: "10%" }]} value={s.whtRate || null} onChange={(v) => update("whtRate", v as number)} layout="inline-2" disabled={saving} /></Field>
                            {s.cost > 0 && s.whtRate > 0 && (<p className="mt-2 text-xs text-[var(--cl-text-muted)]">Computed WHT: <span className="mono text-[var(--cl-text)]">₦{formatNaira(whtPreview)}</span></p>)}
                        </CollapseField>
                    </Field>
                    <Field label="Remarks"><TextArea value={s.remarks} onChange={(e) => update("remarks", e.target.value)} placeholder="Optional notes" rows={3} disabled={saving} /></Field>
                </div>
            </SlidePanel>
            <VendorPicker open={pickerOpen} onClose={() => { setPickerOpen(false); onClose(); }} onBack={() => setPickerOpen(false)} selectedId={s.supplier?.id ?? null} onSelect={(v) => { update("supplier", v); setPickerOpen(false); }} title="Select Supplier" />
        </>
    );
}

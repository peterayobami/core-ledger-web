import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { SlidePanel } from "@/components/cl/SlidePanel";
import { Button } from "@/components/cl/Button";
import { Field, TextInput, TextArea, CurrencyInput, DateField, ServerErrorBanner, CollapseField } from "@/components/cl/Field";
import { ChipSelector } from "@/components/cl/Chip";
import { SelectorTrigger, VendorPicker } from "@/components/cl/SelectorPicker";
import { api, getVendor } from "@/data/store";
import type { Purchase, Vendor } from "@/data/types";
import { formatNaira } from "@/lib/format";

interface Props { open: boolean; mode: "create" | "edit"; initial?: Purchase | null; onClose: () => void; onSaved: (p: Purchase) => void; }
interface FS { description: string; invoiceNumber: string; cost: number; datePurchased: string; isVatApplicable: boolean; vendor: Vendor | null; isWhtApplicable: boolean; whtRate: number; remarks: string; }
const empty = (): FS => ({ description: "", invoiceNumber: "", cost: 0, datePurchased: "", isVatApplicable: false, vendor: null, isWhtApplicable: false, whtRate: 0, remarks: "" });

export function PurchaseFormPanel({ open, mode, initial, onClose, onSaved }: Props) {
    const [s, setS] = React.useState<FS>(empty());
    const [submitted, setSubmitted] = React.useState(false);
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [pickerOpen, setPickerOpen] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        setSubmitted(false); setServerError(null); setSaving(false);
        if (mode === "edit" && initial) {
            setS({ description: initial.description, invoiceNumber: initial.invoiceNumber, cost: initial.cost, datePurchased: initial.datePurchased, isVatApplicable: initial.isVatApplicable, vendor: getVendor(initial.vendorId) ?? null, isWhtApplicable: initial.isWhtApplicable, whtRate: initial.whtRate, remarks: initial.remarks ?? "" });
        } else setS(empty());
    }, [open, mode, initial]);

    const update = <K extends keyof FS>(k: K, v: FS[K]) => setS((p) => ({ ...p, [k]: v }));

    const errors = React.useMemo(() => {
        if (!submitted) return {} as Record<string, string>;
        const e: Record<string, string> = {};
        if (!s.description.trim()) e.description = "Description is required.";
        if (!s.invoiceNumber.trim()) e.invoiceNumber = "Invoice number is required.";
        if (!s.cost || s.cost <= 0) e.cost = "Cost must be greater than 0.";
        if (!s.vendor) e.vendor = "Please select a vendor.";
        if (!s.datePurchased) e.datePurchased = "Date is required.";
        else if (new Date(s.datePurchased) > new Date()) e.datePurchased = "Date cannot be in the future.";
        if (s.isWhtApplicable && !s.whtRate) e.whtRate = "Select a WHT rate.";
        return e;
    }, [submitted, s]);

    const vatPreview = s.isVatApplicable ? s.cost * 0.075 : 0;
    const whtPreview = s.isWhtApplicable ? s.cost * (s.whtRate / 100) : 0;

    async function handleSubmit() {
        setSubmitted(true); setServerError(null);
        if (!s.description.trim() || !s.invoiceNumber.trim() || !s.cost || !s.vendor || !s.datePurchased) return;
        if (s.isWhtApplicable && !s.whtRate) return;
        setSaving(true);
        try {
            const payload = { description: s.description.trim(), invoiceNumber: s.invoiceNumber.trim(), cost: s.cost, datePurchased: new Date(s.datePurchased).toISOString(), isVatApplicable: s.isVatApplicable, vendorId: s.vendor!.id, isWhtApplicable: s.isWhtApplicable, whtRate: s.whtRate, remarks: s.remarks.trim() || undefined };
            const result = mode === "create" ? await api.createPurchase(payload) : await api.updatePurchase(initial!.id, payload);
            onSaved(result);
        } catch (err) { setServerError(err instanceof Error ? err.message : "Could not save purchase."); }
        finally { setSaving(false); }
    }

    const today = new Date().toISOString().slice(0, 10);
    const isEdit = mode === "edit";

    return (
        <>
            <SlidePanel open={open} onClose={onClose} title={isEdit ? "Edit Purchase" : "New Purchase"} icon={<ShoppingCart size={18} />}
                footer={<><Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} loading={saving}>{isEdit ? "Save Changes" : "Save Purchase"}</Button></>}
            >
                <div className="space-y-5">
                    <ServerErrorBanner message={serverError} />
                    <Field label="Description" required error={errors.description}><TextInput value={s.description} onChange={(e) => update("description", e.target.value)} placeholder="e.g. Server Rack Equipment" error={!!errors.description} disabled={saving} /></Field>
                    <Field label="Invoice Number" required error={errors.invoiceNumber}><TextInput value={s.invoiceNumber} onChange={(e) => update("invoiceNumber", e.target.value)} placeholder="INV-2025-0001" mono error={!!errors.invoiceNumber} disabled={saving} /></Field>
                    <Field label="Cost (₦)" required error={errors.cost}><CurrencyInput value={s.cost} onChange={(v) => update("cost", v)} placeholder="e.g. 250,000" error={!!errors.cost} disabled={saving} /></Field>
                    <Field label="Vendor" required error={errors.vendor}><SelectorTrigger value={s.vendor?.name ?? ""} placeholder="Select vendor…" onClick={() => setPickerOpen(true)} error={!!errors.vendor} /></Field>
                    <Field label="Date Purchased" required error={errors.datePurchased}><DateField value={s.datePurchased} onChange={(v) => update("datePurchased", v)} max={today} error={!!errors.datePurchased} disabled={saving} /></Field>
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
            <VendorPicker open={pickerOpen} onClose={() => { setPickerOpen(false); onClose(); }} onBack={() => setPickerOpen(false)} selectedId={s.vendor?.id ?? null} onSelect={(v) => { update("vendor", v); setPickerOpen(false); }} />
        </>
    );
}

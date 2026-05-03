import * as React from "react";
import { Package } from "lucide-react";
import { SlidePanel } from "@/components/cl/SlidePanel";
import { Button } from "@/components/cl/Button";
import { Field, TextInput, TextArea, CurrencyInput, DateField, ServerErrorBanner } from "@/components/cl/Field";
import { ChipSelector } from "@/components/cl/Chip";
import { SelectorTrigger, VendorPicker } from "@/components/cl/SelectorPicker";
import { api, getVendor, classifications as classList } from "@/data/store";
import type { Asset, DepreciationMethod, Vendor } from "@/data/types";
import { COA_ACCOUNTS } from "@/lib/services/ledger.service";

// 🔌 BACKEND: Asset account options come from GET /api/accounts?type=Asset&subType=Non-current+Asset.
// coaAccountCode is sent with POST /assets so the backend journal service
// knows which account to debit on capitalisation: Dr {coaAccountCode} / Cr 2100 Accounts Payable.
const assetAccounts = COA_ACCOUNTS.filter(a => a.type === "Asset" && a.subType.toLowerCase().includes("non-current") && a.isActive && !a.code.endsWith("000"));

interface AssetFormPanelProps {
    open: boolean;
    mode: "create" | "edit";
    initial?: Asset | null;
    onClose: () => void;
    onSaved: (a: Asset) => void;
}

interface FormState {
    description: string;
    cost: number;
    classificationId: string | null;
    vendor: Vendor | null;
    datePurchased: string;
    depreciationMethod: DepreciationMethod;
    coaAccountCode: string | null;
    remarks: string;
}

function emptyState(): FormState {
    return { description: "", cost: 0, classificationId: null, vendor: null, datePurchased: "", depreciationMethod: "StraightLine", coaAccountCode: null, remarks: "" };
}

export function AssetFormPanel({ open, mode, initial, onClose, onSaved }: AssetFormPanelProps) {
    const [state, setState] = React.useState<FormState>(emptyState());
    const [submitted, setSubmitted] = React.useState(false);
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [pickerOpen, setPickerOpen] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        setSubmitted(false); setServerError(null); setSaving(false);
        if (mode === "edit" && initial) {
            setState({ description: initial.description, cost: initial.cost, classificationId: initial.classificationId, vendor: getVendor(initial.vendorId) ?? null, datePurchased: initial.datePurchased, depreciationMethod: initial.depreciationMethod, coaAccountCode: initial.coaAccountCode ?? null, remarks: initial.remarks ?? "" });
        } else { setState(emptyState()); }
    }, [open, mode, initial]);

    const errors = React.useMemo(() => {
        if (!submitted) return {} as Record<string, string>;
        const e: Record<string, string> = {};
        if (!state.description.trim()) e.description = "Description is required.";
        if (!state.cost || state.cost <= 0) e.cost = "Cost must be greater than 0.";
        if (!state.classificationId) e.classificationId = "Please select a classification.";
        if (!state.vendor) e.vendor = "Please select a vendor.";
        if (!state.datePurchased) e.datePurchased = "Date is required.";
        else if (new Date(state.datePurchased) > new Date()) e.datePurchased = "Date cannot be in the future.";
        return e;
    }, [submitted, state]);

    const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setState((s) => ({ ...s, [k]: v }));

    async function handleSubmit() {
        setSubmitted(true); setServerError(null);
        const e: Record<string, string> = {};
        if (!state.description.trim()) e.description = "x";
        if (!state.cost || state.cost <= 0) e.cost = "x";
        if (!state.classificationId) e.classificationId = "x";
        if (!state.vendor) e.vendor = "x";
        if (!state.datePurchased) e.datePurchased = "x";
        if (Object.keys(e).length) return;
        setSaving(true);
        try {
            const payload = { description: state.description.trim(), cost: state.cost, classificationId: state.classificationId!, vendorId: state.vendor!.id, datePurchased: new Date(state.datePurchased).toISOString(), depreciationMethod: state.depreciationMethod, coaAccountCode: state.coaAccountCode ?? undefined, remarks: state.remarks.trim() || undefined };
            const result = mode === "create" ? await api.createAsset(payload) : await api.updateAsset(initial!.id, payload);
            onSaved(result);
        } catch (err) { setServerError(err instanceof Error ? err.message : "Could not save asset."); }
        finally { setSaving(false); }
    }

    const today = new Date().toISOString().slice(0, 10);
    const isEdit = mode === "edit";

    return (
        <>
            <SlidePanel open={open} onClose={onClose} title={isEdit ? "Edit Asset" : "New Asset"} icon={<Package size={18} />}
                footer={<><Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={handleSubmit} loading={saving}>{isEdit ? "Save Changes" : "Save Asset"}</Button></>}
            >
                <div className="space-y-5">
                    <ServerErrorBanner message={serverError} />
                    <Field label="Description" required error={errors.description}>
                        <TextInput value={state.description} onChange={(e) => update("description", e.target.value)} placeholder="e.g. HP LaserJet Printer" error={!!errors.description} disabled={saving} />
                    </Field>
                    <Field label="Cost (₦)" required error={errors.cost}>
                        <CurrencyInput value={state.cost} onChange={(v) => update("cost", v)} placeholder="e.g. 250,000" error={!!errors.cost} readOnly={isEdit} disabled={saving} />
                        {isEdit && <p className="mt-1.5 text-[11px] text-[var(--cl-text-faded)]">Use &quot;Update Cost&quot; on the asset page to change cost.</p>}
                    </Field>
                    <Field label="Asset Classification" required error={errors.classificationId}>
                        <ChipSelector options={classList.map((c) => ({ value: c.id, label: c.name, description: `${c.depreciationRate}%` }))} value={state.classificationId} onChange={(v) => update("classificationId", v)} layout="wrap" disabled={saving} />
                    </Field>
                    <Field label="Vendor" required error={errors.vendor}>
                        <SelectorTrigger value={state.vendor?.name ?? ""} placeholder="Select vendor…" onClick={() => setPickerOpen(true)} error={!!errors.vendor} />
                    </Field>
                    <Field label="Date Purchased" required error={errors.datePurchased}>
                        <DateField value={state.datePurchased} onChange={(v) => update("datePurchased", v)} max={today} error={!!errors.datePurchased} disabled={saving} />
                    </Field>
                    <Field label="Asset Account (GL)" hint="Fixed asset account to debit on capitalisation">
                        <select value={state.coaAccountCode ?? ""} onChange={(e) => update("coaAccountCode", e.target.value || null)} disabled={saving} className="w-full rounded-md border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--cl-primary)]">
                            <option value="">Select account…</option>
                            {assetAccounts.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Depreciation Method" required>
                        <ChipSelector options={[{ value: "StraightLine" as const, label: "Straight Line" }, { value: "ReducingBalance" as const, label: "Reducing Balance" }]} value={state.depreciationMethod} onChange={(v) => update("depreciationMethod", v)} layout="inline-2" disabled={saving} />
                    </Field>
                    <Field label="Remarks">
                        <TextArea value={state.remarks} onChange={(e) => update("remarks", e.target.value)} placeholder="Optional notes about this asset" rows={3} disabled={saving} />
                    </Field>
                </div>
            </SlidePanel>
            <VendorPicker open={pickerOpen} onClose={() => { setPickerOpen(false); onClose(); }} onBack={() => setPickerOpen(false)} selectedId={state.vendor?.id ?? null} onSelect={(v) => { update("vendor", v); setPickerOpen(false); }} />
        </>
    );
}

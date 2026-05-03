import { OrgSettingsShell } from "@/components/settings/OrgSettingsShell";
import { PageCard, SectionHeading } from "@/components/reports/ReportPrimitives";
import { useOrgSettings } from "@/stores/org-settings.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Prescribed FIRS WHT categories. Used both as a reference guide and to seed quick-add.
const FIRS_WHT_REFERENCE = [
    { category: "Dividends", rate: 10 },
    { category: "Interest", rate: 10 },
    { category: "Royalties", rate: 10 },
    { category: "Rent (corporate)", rate: 10 },
    { category: "Management fees", rate: 10 },
    { category: "Directors' fees", rate: 10 },
    { category: "Professional services", rate: 5 },
    { category: "Consultancy / Technical services", rate: 5 },
    { category: "Supply of goods", rate: 5 },
    { category: "Construction (resident)", rate: 2.5 },
    { category: "Construction (non-resident)", rate: 5 },
];

// Development Levy rate is government-mandated (Finance Act 2018) — not configurable.
const DEV_LEVY_RATE = 0.5; // 0.5% of gross turnover

export default function TaxConfigPage() {
    const taxConfig = useOrgSettings(s => s.taxConfig);
    const updateTaxConfig = useOrgSettings(s => s.updateTaxConfig);
    const setUnrecoupedCABF = useOrgSettings(s => s.setUnrecoupedCABF);
    const fiscalYears = useOrgSettings(s => s.fiscalYears);

    const [newCat, setNewCat] = useState("");
    const [newRate, setNewRate] = useState<number | "">(10);
    const [showRef, setShowRef] = useState(false);

    function removeWht(idx: number) {
        updateTaxConfig({ whtSchedule: taxConfig.whtSchedule.filter((_, i) => i !== idx) });
    }

    function addWht() {
        const cat = newCat.trim();
        if (!cat) { toast.error("Enter a payment category."); return; }
        const rate = Number(newRate);
        if (!rate || rate <= 0 || rate > 100) { toast.error("Enter a valid rate between 0.1 and 100."); return; }

        // Deduplication — case-insensitive
        const duplicate = taxConfig.whtSchedule.some(
            r => r.category.toLowerCase() === cat.toLowerCase()
        );
        if (duplicate) {
            toast.error(`"${cat}" already exists in the schedule. Edit or remove the existing entry.`);
            return;
        }

        updateTaxConfig({ whtSchedule: [...taxConfig.whtSchedule, { category: cat, rate }] });
        setNewCat(""); setNewRate(10);
    }

    function quickAddFromReference(category: string, rate: number) {
        if (taxConfig.whtSchedule.some(r => r.category.toLowerCase() === category.toLowerCase())) {
            toast.info(`"${category}" is already in your schedule.`);
            return;
        }
        updateTaxConfig({ whtSchedule: [...taxConfig.whtSchedule, { category, rate }] });
        toast.success(`Added: ${category} — ${rate}%`);
    }

    return (
        <OrgSettingsShell title="Tax Configuration">
            <div className="space-y-6">

                {/* ── VAT ── */}
                <PageCard title="Value Added Tax (VAT)">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Standard VAT Rate</Label>
                            <Input
                                type="number"
                                value={taxConfig.vatRate}
                                disabled
                                className="mono mt-1"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Government-regulated at <strong>7.5%</strong> (Finance Act 2020). Not editable.
                            </p>
                        </div>
                        <div className="md:col-span-2 flex items-start pt-6">
                            <div className="rounded-md bg-secondary/60 border border-border px-4 py-3 text-[12px] text-muted-foreground leading-relaxed">
                                <strong className="text-foreground">Note:</strong> Nigeria operates three VAT categories —
                                <strong> Standard-rated</strong> (7.5%), <strong>Zero-rated</strong> (exports, basic food, medicines),
                                and <strong>Exempt</strong> (financial services, educational services). Apply the correct
                                category on each Revenue transaction.
                                {/* 🔌 BACKEND: VAT return period (monthly/quarterly) and VAT registration
                                    number are company-level settings — add to Company Profile once FIRS API integration is live. */}
                            </div>
                        </div>
                    </div>
                </PageCard>

                {/* ── WHT ── */}
                <PageCard title="Withholding Tax (WHT) Schedule">
                    <p className="text-[12.5px] text-muted-foreground mb-4">
                        Rates applied at source when making payments to vendors and suppliers, per FIRS WHT regulations.
                        Resident company rates are shown. Non-resident rates may differ — add a separate entry if needed.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Payment Category</th>
                                    <th className="text-right py-2 px-3 font-medium text-muted-foreground w-[100px]">Rate (%)</th>
                                    <th className="w-12 py-2 px-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {taxConfig.whtSchedule.map((r, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                                        <td className="py-2 px-3">{r.category}</td>
                                        <td className="py-2 px-3 mono text-right font-medium">{r.rate}%</td>
                                        <td className="py-2 px-3">
                                            <button
                                                onClick={() => removeWht(i)}
                                                className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10"
                                                title="Remove"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Add row */}
                                <tr className="border-b border-border bg-secondary/30">
                                    <td className="py-2 px-3">
                                        <Input
                                            value={newCat}
                                            onChange={e => setNewCat(e.target.value)}
                                            placeholder="e.g. Agency fees"
                                            className="h-9"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <Input
                                            type="number"
                                            step="0.5"
                                            value={newRate}
                                            onChange={e => setNewRate(e.target.value === "" ? "" : Number(e.target.value))}
                                            className="mono text-right h-9"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <Button size="sm" className="h-9" onClick={addWht} title="Add">
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* FIRS prescribed rates reference */}
                    <div className="mt-4">
                        <button
                            onClick={() => setShowRef(v => !v)}
                            className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline"
                        >
                            <Info className="h-3.5 w-3.5" />
                            {showRef ? "Hide" : "View"} FIRS prescribed rates reference
                        </button>

                        {showRef && (
                            <div className="mt-3 rounded-md border border-border overflow-x-auto">
                                <table className="w-full text-[12.5px]">
                                    <thead>
                                        <tr className="border-b border-border bg-secondary/40">
                                            <th className="text-left py-2 px-3 font-medium text-muted-foreground">Category</th>
                                            <th className="text-right py-2 px-3 font-medium text-muted-foreground">Prescribed Rate</th>
                                            <th className="w-24 py-2 px-3" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {FIRS_WHT_REFERENCE.map(ref => {
                                            const inSchedule = taxConfig.whtSchedule.some(
                                                r => r.category.toLowerCase() === ref.category.toLowerCase()
                                            );
                                            return (
                                                <tr key={ref.category} className="border-b border-border/50">
                                                    <td className="py-1.5 px-3 text-muted-foreground">{ref.category}</td>
                                                    <td className="py-1.5 px-3 mono text-right">{ref.rate}%</td>
                                                    <td className="py-1.5 px-3 text-right">
                                                        {inSchedule ? (
                                                            <span className="text-[11px] text-success font-medium">✓ Added</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => quickAddFromReference(ref.category, ref.rate)}
                                                                className="text-[11px] text-primary hover:underline font-medium"
                                                            >
                                                                + Add
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </PageCard>

                {/* ── CIT ── */}
                <PageCard title="Company Income Tax (CIT)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Size Classification</Label>
                            <Select
                                value={taxConfig.citClassification}
                                onValueChange={v => updateTaxConfig({ citClassification: v as any })}
                            >
                                <SelectTrigger className="bg-card mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Auto">Auto (determined by annual turnover)</SelectItem>
                                    <SelectItem value="Small">Small — turnover ≤ ₦25M · CIT 0%</SelectItem>
                                    <SelectItem value="Medium">Medium — turnover ₦25M–₦100M · CIT 20%</SelectItem>
                                    <SelectItem value="Large">Large — turnover &gt; ₦100M · CIT 30%</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Classification is based on <strong>annual turnover (gross revenue)</strong>, per the Finance Act.
                                "Auto" picks the band from your revenue each year.
                            </p>
                        </div>

                        {/* Development Levy — informational */}
                        <div className="rounded-md border border-border bg-secondary/40 px-4 py-4">
                            <SectionHeading>Development Levy</SectionHeading>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[13px] text-muted-foreground">Rate (% of gross turnover)</span>
                                <span className="mono font-semibold text-[13px]">{DEV_LEVY_RATE}%</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                                Government-mandated (Finance Act 2018). Applies to all companies regardless of CIT band,
                                including Small companies that pay 0% CIT. Not configurable.
                                {/* 🔌 BACKEND: DEV_LEVY_RATE = 0.005 is hardcoded in tax.service.ts.
                                    Any future rate change requires a code update until a rate table is introduced. */}
                            </p>
                        </div>
                    </div>

                    {/* Minimum tax note */}
                    <div className="mt-4 rounded-md bg-warning/10 border border-warning/30 px-4 py-3 text-[12px] text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Minimum Tax:</strong> Where a company's assessable profit is
                        nil or results in tax below the minimum, a minimum tax of <strong>1% of gross turnover</strong> applies
                        (Finance Act 2021 — applicable to Small companies and loss-making companies). The Company Tax
                        computation module applies this automatically where relevant.
                    </div>
                </PageCard>

                {/* ── Capital Allowance Unrecouped B/F ── */}
                <PageCard title="Capital Allowance — Opening Unrecouped Balance">
                    <p className="text-[12.5px] text-muted-foreground mb-4">
                        The opening unrecouped capital allowance balance at the <strong>start</strong> of each fiscal year.
                        This is a tax-only figure used in the CIT computation — it represents unrelieved allowances
                        carried forward from prior years. The Profit &amp; Loss report reads these values automatically.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fiscalYears.map(fy => (
                            <div key={fy.year}>
                                <Label>
                                    Opening Unrecouped CA — start of FY {fy.year} (₦)
                                </Label>
                                <Input
                                    type="number"
                                    value={taxConfig.unrecoupedCABF[fy.year] ?? 0}
                                    onChange={e => setUnrecoupedCABF(fy.year, Number(e.target.value) || 0)}
                                    className="mono mt-1"
                                    disabled={fy.status === "closed"}
                                    placeholder="0"
                                />
                                {fy.status === "closed" && (
                                    <p className="text-[11px] text-muted-foreground mt-1">Locked — fiscal year is closed.</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-4">
                        For subsequent years, the closing unrecouped balance from the Capital Allowance
                        schedule automatically rolls forward — you only need to enter this manually for the
                        first year on the system (migration opening balance).
                        {/* 🔌 BACKEND: GET /api/capital-allowance/:year returns { unrecoupedBF, annualAllowance, twdv }.
                            After go-live, this figure is auto-derived from the prior year's CA schedule. */}
                    </p>
                </PageCard>

            </div>
        </OrgSettingsShell>
    );
}

import { useMemo, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
    ReportKpi, ReportKpiStrip, PageCard, StatementRow, SectionHeading,
} from "@/components/reports/ReportPrimitives";
import { YearSelect } from "@/components/reports/PeriodFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Scale, Boxes, Layers, ShieldCheck, Printer, ChevronDown, AlertTriangle,
} from "lucide-react";
import { computeBalanceSheet } from "@/lib/services/ledger.service";
import type { BSInputs } from "@/lib/models/ledger";
import { defaultYear } from "@/lib/services/tax.service";
import { formatNGN } from "@/lib/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FMT = (n: number) => n < 0 ? `(${formatNGN(Math.abs(n))})` : formatNGN(n);

export default function BalanceSheetPage() {
    const [year, setYear] = useState<number>(defaultYear());
    const [inputs, setInputs] = useState<BSInputs>({
        shareCapital: 0,
        retainedEarningsBF: 0,
        openingCash: 0,
        disposalProceeds: 0,
        capitalIntroduced: 0,
        loanProceeds: 0,
        loanRepayment: 0,
        dividendsPaid: 0,
    });
    const [showInputs, setShowInputs] = useState(true);

    const bs = useMemo(() => computeBalanceSheet(year, inputs), [year, inputs]);

    return (
        <>
            <TopBar title="Balance Sheet" />
            <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reports</div>
                        <h1 className="text-xl font-semibold mt-1">Balance Sheet</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Statement of Financial Position — As at 31 Dec {year}.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <YearSelect value={year} onChange={setYear} />
                        <Button variant="outline" onClick={() => toast.info("Export coming soon")}>
                            <Printer className="h-4 w-4 mr-1.5" /> Export
                        </Button>
                    </div>
                </header>

                <ReportKpiStrip>
                    <ReportKpi label="Total Assets" value={formatNGN(bs.assets.totalAssets)}
                        hint="Current + Non-current" icon={Boxes} tone="primary" />
                    <ReportKpi label="Total Liabilities" value={formatNGN(bs.liabilities.totalLiabilities)}
                        hint="All obligations" icon={Layers} tone="warning" />
                    <ReportKpi label="Total Equity" value={formatNGN(bs.equity.totalEquity)}
                        hint="Capital + RE" icon={Scale} tone="success" />
                    <ReportKpi label="Balance Check" value={bs.isBalanced ? "Balanced" : "Imbalanced"}
                        hint={bs.isBalanced ? "A = L + E ✓" : `Δ ${formatNGN(bs.imbalance)}`}
                        icon={bs.isBalanced ? ShieldCheck : AlertTriangle}
                        tone={bs.isBalanced ? "success" : "danger"} />
                </ReportKpiStrip>

                {/* Inputs */}
                <PageCard>
                    <Collapsible open={showInputs} onOpenChange={setShowInputs}>
                        <CollapsibleTrigger asChild>
                            <button className="w-full flex items-center justify-between mb-2">
                                <h2 className="text-[15px] font-semibold">Equity & Cash Inputs</h2>
                                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showInputs && "rotate-180")} />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <p className="text-[12px] text-muted-foreground mb-3">
                                Editable drivers — backend will source these from the equity sub-ledger and prior-period balances.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <NumField label="Share Capital" value={inputs.shareCapital}
                                    onChange={(v) => setInputs(s => ({ ...s, shareCapital: v }))} />
                                <NumField label="Retained Earnings B/F" value={inputs.retainedEarningsBF}
                                    onChange={(v) => setInputs(s => ({ ...s, retainedEarningsBF: v }))} />
                                <NumField label="Opening Cash" value={inputs.openingCash}
                                    onChange={(v) => setInputs(s => ({ ...s, openingCash: v }))} />
                                <NumField label="Disposal Proceeds" value={inputs.disposalProceeds}
                                    onChange={(v) => setInputs(s => ({ ...s, disposalProceeds: v }))} />
                                <NumField label="Capital Introduced" value={inputs.capitalIntroduced}
                                    onChange={(v) => setInputs(s => ({ ...s, capitalIntroduced: v }))} />
                                <NumField label="Loan Proceeds" value={inputs.loanProceeds}
                                    onChange={(v) => setInputs(s => ({ ...s, loanProceeds: v }))} />
                                <NumField label="Loan Repayment" value={inputs.loanRepayment}
                                    onChange={(v) => setInputs(s => ({ ...s, loanRepayment: v }))} />
                                <NumField label="Dividends Paid" value={inputs.dividendsPaid}
                                    onChange={(v) => setInputs(s => ({ ...s, dividendsPaid: v }))} />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </PageCard>

                {/* Statement */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assets */}
                    <PageCard title="Assets">
                        <SectionHeading>Current Assets</SectionHeading>
                        {bs.assets.currentAssets.items.map((it) => (
                            <StatementRow key={it.label} label={it.label} value={FMT(it.value)}
                                indent={1} negative={it.value < 0} />
                        ))}
                        <StatementRow label="Total Current Assets" value={formatNGN(bs.assets.currentAssets.subtotal)}
                            total bold />

                        <SectionHeading>Non-Current Assets</SectionHeading>
                        {bs.assets.nonCurrentAssets.items.map((it) => (
                            <StatementRow key={it.label} label={it.label} value={FMT(it.value)}
                                indent={1} negative={it.value < 0}
                                muted={it.label.startsWith("Less")} bold={it.label === "Net Book Value"} />
                        ))}

                        <div className="mt-5 pt-4 border-t-2 border-border-strong">
                            <StatementRow label="TOTAL ASSETS" value={formatNGN(bs.assets.totalAssets)} large />
                        </div>
                    </PageCard>

                    {/* Liabilities & Equity */}
                    <PageCard title="Liabilities & Equity">
                        <SectionHeading>Current Liabilities</SectionHeading>
                        {bs.liabilities.currentLiabilities.items.map((it) => (
                            <StatementRow key={it.label} label={it.label} value={FMT(it.value)}
                                indent={1} negative={it.value < 0} />
                        ))}
                        <StatementRow label="Total Liabilities" value={formatNGN(bs.liabilities.totalLiabilities)}
                            total bold />

                        <SectionHeading>Equity</SectionHeading>
                        {bs.equity.items.map((it) => (
                            <StatementRow key={it.label} label={it.label} value={FMT(it.value)}
                                indent={1} negative={it.value < 0}
                                bold={it.label.includes("Closing")}
                                muted={it.label.includes("Add:")} />
                        ))}
                        <StatementRow label="Total Equity" value={formatNGN(bs.equity.totalEquity)}
                            total bold />

                        <div className="mt-5 pt-4 border-t-2 border-border-strong">
                            <StatementRow label="TOTAL LIABILITIES & EQUITY"
                                value={formatNGN(bs.totalLiabilitiesAndEquity)} large />
                        </div>
                    </PageCard>
                </div>

                {!bs.isBalanced && (
                    <div className="p-4 rounded-lg border border-danger/30 bg-danger/5 text-[13px] text-danger flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                            <div className="font-semibold">Balance Sheet does not balance</div>
                            <div className="text-[12px] mt-0.5">
                                Assets exceed Liabilities + Equity by{" "}
                                <span className="mono font-semibold">{formatNGN(Math.abs(bs.imbalance))}</span>.
                                Adjust Share Capital, Retained Earnings B/F, or Opening Cash above to reconcile.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function NumField({
    label, value, onChange,
}: Readonly<{ label: string; value: number; onChange: (v: number) => void }>) {
    return (
        <div>
            <Label className="text-[12px] text-muted-foreground">{label}</Label>
            <Input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value) || 0)}
                className="mono mt-1"
            />
        </div>
    );
}

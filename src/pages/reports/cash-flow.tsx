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
    ArrowDownUp, Wallet, TrendingUp, TrendingDown, Printer, ChevronDown,
} from "lucide-react";
import { computeCashFlow } from "@/lib/services/ledger.service";
import type { CFInputs } from "@/lib/models/ledger";
import { defaultYear } from "@/lib/services/tax.service";
import { formatNGN } from "@/lib/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FMT = (n: number) => n < 0 ? `(${formatNGN(Math.abs(n))})` : formatNGN(n);

export default function CashFlowPage() {
    const [year, setYear] = useState<number>(defaultYear());
    const [inputs, setInputs] = useState<CFInputs>({
        openingCash: 0,
        disposalProceeds: 0,
        capitalIntroduced: 0,
        loanProceeds: 0,
        loanRepayment: 0,
        dividendsPaid: 0,
    });
    const [showInputs, setShowInputs] = useState(true);

    const cf = useMemo(() => computeCashFlow(year, inputs), [year, inputs]);

    const op = cf.sections[0];
    const inv = cf.sections[1];
    const fin = cf.sections[2];

    return (
        <>
            <TopBar title="Cash Flow Statement" />
            <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reports</div>
                        <h1 className="text-xl font-semibold mt-1">Cash Flow Statement</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Indirect method — Operating, Investing, Financing for FY {year}.
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
                    <ReportKpi label="Opening Cash" value={formatNGN(cf.openingCash)}
                        hint={`As at 1 Jan ${year}`} icon={Wallet} tone="muted" />
                    <ReportKpi label="Net Cash Movement" value={FMT(cf.netChange)}
                        hint="Total inflow / (outflow)" icon={ArrowDownUp}
                        tone={cf.netChange >= 0 ? "success" : "danger"} />
                    <ReportKpi label="Operating CF" value={FMT(op.subtotal)}
                        hint="From core operations" icon={op.subtotal >= 0 ? TrendingUp : TrendingDown}
                        tone={op.subtotal >= 0 ? "success" : "warning"} />
                    <ReportKpi label="Closing Cash" value={formatNGN(cf.closingCash)}
                        hint={`As at 31 Dec ${year}`} icon={Wallet} tone="primary" />
                </ReportKpiStrip>

                {/* Inputs */}
                <PageCard>
                    <Collapsible open={showInputs} onOpenChange={setShowInputs}>
                        <CollapsibleTrigger asChild>
                            <button className="w-full flex items-center justify-between mb-2">
                                <h2 className="text-[15px] font-semibold">Cash Flow Inputs</h2>
                                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showInputs && "rotate-180")} />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <p className="text-[12px] text-muted-foreground mb-3">
                                Editable, tenant-controlled drivers. Backend will source these from posted journals — values here are overrides for what-if analysis.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                <PageCard title={`Statement of Cash Flows — FY ${year}`}>
                    <div>
                        <SectionHeading>Operating Activities</SectionHeading>
                        {op.items.map((it) => (
                            <StatementRow key={it.label} label={it.label} value={FMT(it.value)}
                                indent={1} negative={it.value < 0}
                                muted={it.label.includes("Add:") || it.label.startsWith("(")} />
                        ))}
                        <StatementRow label="Net Cash from Operating Activities" value={FMT(op.subtotal)}
                            total bold negative={op.subtotal < 0} />

                        <SectionHeading>Investing Activities</SectionHeading>
                        {inv.items.map((it) => (
                            <StatementRow key={it.label} label={it.label} value={FMT(it.value)}
                                indent={1} negative={it.value < 0} />
                        ))}
                        <StatementRow label="Net Cash from Investing Activities" value={FMT(inv.subtotal)}
                            total bold negative={inv.subtotal < 0} />

                        <SectionHeading>Financing Activities</SectionHeading>
                        {fin.items.map((it) => (
                            <StatementRow key={it.label} label={it.label} value={FMT(it.value)}
                                indent={1} negative={it.value < 0} />
                        ))}
                        <StatementRow label="Net Cash from Financing Activities" value={FMT(fin.subtotal)}
                            total bold negative={fin.subtotal < 0} />

                        <div className="mt-5 pt-4 border-t-2 border-border-strong space-y-1">
                            <StatementRow label="Net Increase / (Decrease) in Cash"
                                value={FMT(cf.netChange)} bold negative={cf.netChange < 0} />
                            <StatementRow label="Cash & Cash Equivalents — Opening"
                                value={formatNGN(cf.openingCash)} muted />
                            <StatementRow label="Cash & Cash Equivalents — Closing"
                                value={formatNGN(cf.closingCash)} large />
                        </div>
                    </div>
                </PageCard>
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

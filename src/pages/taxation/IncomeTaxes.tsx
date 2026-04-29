import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ReportKpi, ReportKpiStrip, PageCard, StatementRow }
  from "@/components/reports/ReportPrimitives";
import { YearSelect } from "@/components/reports/PeriodFilter";
import {
  defaultYear, revenuesIn, purchasesIn, expensesIn,
  depreciationAddbackFor, computeTax, bandFor,
} from "@/lib/services/tax.service";
import { formatNGN } from "@/lib/utils/format";
import {
  TrendingUp, ShieldCheck, Calculator, Receipt,
  AlertTriangle, ArrowRight, Lock, Info, FileText,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NEG = (n: number) => `(${formatNGN(Math.abs(n))})`;

export default function IncomeTaxesPage() {
  const [year, setYear] = useState<number>(defaultYear());
  const [caStatus, setCaStatus] = useState<"pending" | "locked">("pending");

  // Editable inputs
  const [unrecoupedCABF, setUnrecoupedCABF] = useState(0);
  const [annualAllowance, setAnnualAllowance] = useState(0);
  const [balancingAllowance, setBalancingAllowance] = useState(0);
  const [balancingCharge, setBalancingCharge] = useState(0);

  const data = useMemo(() => {
    const revs = revenuesIn(year);
    const purs = purchasesIn(year);
    const exps = expensesIn(year);
    const totalRevenue = revs.reduce((s, r) => s + r.sales, 0);
    const totalPurchases = purs.reduce((s, p) => s + p.cost, 0);
    const totalExpenses = exps.reduce((s, e) => s + e.cost, 0);
    const depreciationAddback = depreciationAddbackFor(year);
    const t = computeTax({
      grossIncome: totalRevenue,
      costOfSales: totalPurchases,
      expenses: totalExpenses,
      depreciationAddback,
      unrecoupedCABF,
      annualAllowance,
      balancingAllowance,
      balancingCharge,
    });
    return {
      totalRevenue, totalPurchases, totalExpenses, depreciationAddback, ...t,
    };
  }, [year, unrecoupedCABF, annualAllowance, balancingAllowance, balancingCharge]);

  return (
    <AppShell title="Company Tax (CIT)">
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Taxation</div>
            <h1 className="text-xl font-semibold mt-1">Company Income Tax — AY {year + 1}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Basis Period: 01 Jan {year} – 31 Dec {year}
            </p>
          </div>
          <YearSelect value={year} onChange={setYear} />
        </header>

        {/* CA gate */}
        {caStatus !== "locked" ? (
          <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-4">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold">CA Schedule Lock Required</div>
              <p className="text-[13px] text-foreground/80 mt-1">
                The Capital Allowance Schedule for FY {year} must be locked before the tax liability can be finalised.
              </p>
            </div>
            <button
              onClick={() => setCaStatus("locked")}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-warning text-warning-foreground text-sm hover:bg-warning/90"
            >
              <Lock className="h-3.5 w-3.5" /> Mark CA as Locked
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-[13px] text-success">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-semibold">CA Schedule Locked — FY {year}</span>
            <button
              className="ml-auto text-[12px] text-muted-foreground hover:underline"
              onClick={() => setCaStatus("pending")}
            >Reset</button>
          </div>
        )}

        {/* KPIs */}
        <ReportKpiStrip>
          <ReportKpi label="Adjusted Profit" value={formatNGN(data.adjustedProfit)}
            hint="Net profit + depreciation add-back" icon={TrendingUp} tone="primary" />
          <ReportKpi label="Capital Allowance" value={formatNGN(data.totalCAAvailable)}
            hint="Total CA available (B/F + current year)" icon={ShieldCheck} tone="skyblue" />
          <ReportKpi label="Assessable Income" value={formatNGN(data.assessableIncome)}
            hint="After CA relief" icon={Calculator} tone="warning" />
          <ReportKpi label="CIT Payable" value={formatNGN(data.citPayable)}
            hint={`${data.band} company · ${data.citRate}% rate`}
            icon={Receipt} tone={data.citPayable > 0 ? "purple" : "success"} />
        </ReportKpiStrip>

        {caStatus === "locked" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section A */}
              <PageCard title="A · Adjusted Profit Computation">
                <p className="text-[12px] text-muted-foreground -mt-3 mb-3">Statutory adjustment of accounting profit</p>
                <StatementRow label="Gross Income (Revenue)" value={formatNGN(data.totalRevenue)} />
                <StatementRow label="Less: Cost of Sales (Purchases)" value={NEG(data.totalPurchases)} negative />
                <StatementRow label="Less: Tax-Deductible Expenses" value={NEG(data.totalExpenses)} negative />
                <StatementRow label="Add: Depreciation Add-back" value={formatNGN(data.depreciationAddback)} />
                <StatementRow label="Adjusted Profit" value={formatNGN(data.adjustedProfit)} large total />
              </PageCard>

              {/* Section B */}
              <PageCard title="B · Capital Allowance Relief">
                <p className="text-[12px] text-muted-foreground -mt-3 mb-3">Application of CA against adjusted profit</p>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px]">Unrecouped CA Brought Forward</span>
                  <NumInput value={unrecoupedCABF} onChange={setUnrecoupedCABF} />
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px]">Add: Annual Allowance (FY {year})</span>
                  <NumInput value={annualAllowance} onChange={setAnnualAllowance} />
                </div>
                <StatementRow label="Total Capital Allowance Available"
                  value={formatNGN(unrecoupedCABF + annualAllowance)} bold total />

                <div className="flex items-center justify-between py-1.5 mt-2">
                  <span className="text-[13px]">Balancing Allowance</span>
                  <NumInput value={balancingAllowance} onChange={setBalancingAllowance} />
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px]">Balancing Charge</span>
                  <NumInput value={balancingCharge} onChange={setBalancingCharge} negative />
                </div>

                <div className="flex items-center justify-between py-1.5 border-t border-border-strong mt-1 pt-2">
                  <span className="text-[13px] inline-flex items-center gap-1.5 font-medium">
                    Less: CA Relieved (limited to Adj. Profit)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          Under NTA 2025, the previous 2/3-of-assessable-profit restriction has been
                          abolished. The full adjusted profit is available for CA relief.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <span className="mono text-[13px] text-danger font-semibold">{NEG(data.caRelieved)}</span>
                </div>
                <StatementRow label="Unrecouped CA Carried Forward" value={formatNGN(data.unrecoupedCF)} bold total />
              </PageCard>

              {/* Section C */}
              <PageCard title="C · Tax Liability">
                <p className="text-[12px] text-muted-foreground -mt-3 mb-3">Application of CIT band rate</p>
                <StatementRow label="Assessable Income" value={formatNGN(data.assessableIncome)} />
                <StatementRow label={`Company Income Tax @ ${data.citRate}%`}
                  value={formatNGN(data.citPayable)} large total />

                <div className="mt-4 rounded-lg bg-secondary/50 p-3">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                    CIT Rate Determination
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[12px] mb-3">
                    <div><div className="text-muted-foreground">Gross Income</div><div className="mono font-semibold">{formatNGN(data.totalRevenue)}</div></div>
                    <div><div className="text-muted-foreground">Band Applied</div><div className="font-semibold">{data.band}</div></div>
                    <div><div className="text-muted-foreground">Rate</div><div className="font-semibold">{data.citRate}%</div></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { band: "Small",  text: "≤ ₦25M · 0%" },
                      { band: "Medium", text: "≤ ₦100M · 20%" },
                      { band: "Large",  text: "> ₦100M · 30%" },
                    ].map(b => (
                      <div key={b.band}
                        className={cn(
                          "rounded-lg px-3 py-2 text-center text-[12px] font-medium",
                          data.band === b.band
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}>
                        <div className="text-[11px] opacity-80">{b.band}</div>
                        <div>{b.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-2">CITA 3rd Schedule · NTA 2025</div>
                </div>

                {data.citPayable === 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-success/15 text-success text-[12px] font-medium px-3 py-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    No CIT Payable — CA fully covers adjusted profit
                  </div>
                )}
              </PageCard>

              {/* Section D */}
              <PageCard title="D · Development Levy / Minimum Tax">
                <p className="text-[12px] text-muted-foreground -mt-3 mb-3">Applies regardless of profit position — CITA s.33</p>
                <StatementRow label="Gross Turnover (Revenue)" value={formatNGN(data.totalRevenue)} />
                <StatementRow label="Minimum Tax Rate" value="0.5%" muted />
                <StatementRow label="Development Levy Payable" value={formatNGN(data.developmentLevy)} large total />
                <p className="mt-3 rounded-lg bg-primary/8 text-[12px] text-foreground/80 p-3">
                  The Development Levy (minimum tax) is charged at 0.5% of gross turnover. It applies
                  even when the company has no taxable profit or when CIT is zero due to capital
                  allowance relief. It is not deductible for future CIT purposes.
                </p>
              </PageCard>
            </div>

            {/* Right: 1/3 sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-20 cl-card border border-border p-5">
                <h3 className="text-[15px] font-semibold mb-1">Tax Summary — AY {year + 1}</h3>
                <div className="text-[12px] text-muted-foreground mb-3">Live computation snapshot</div>

                <StatementRow label="Fiscal Year" value={`FY ${year}`} muted />
                <StatementRow label="Assessment Year" value={`AY ${year + 1}`} muted />
                <StatementRow label="Basis Period" value={`01 Jan – 31 Dec ${year}`} muted />

                <div className="my-3 border-t border-border" />

                <StatementRow label="Adjusted Profit" value={formatNGN(data.adjustedProfit)} />
                <StatementRow label="CA Relief Utilised" value={formatNGN(data.caRelieved)} />
                <StatementRow label="CA Remaining (C/F)" value={formatNGN(data.unrecoupedCF)} />
                <StatementRow label="Assessable Income" value={formatNGN(data.assessableIncome)} />

                <div className="my-3 border-t border-border" />

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] font-medium">CIT Payable</span>
                  <span className="mono text-[20px] font-bold text-primary">{formatNGN(data.citPayable)}</span>
                </div>
                <StatementRow label="Development Levy" value={formatNGN(data.developmentLevy)} />

                <div className="my-3 border-t border-border-strong" />

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] font-semibold uppercase tracking-wider">Total Tax Payable</span>
                  <span className="mono text-[22px] font-bold text-foreground">
                    {formatNGN(data.totalTaxPayable)}
                  </span>
                </div>
                <StatementRow label="Effective Tax Rate" value={`${data.effectiveTaxRate.toFixed(2)}%`} muted />

                {data.totalTaxPayable === 0 && (
                  <div className="mt-3 inline-flex items-center gap-2 text-success text-[13px] font-medium">
                    <ShieldCheck className="h-4 w-4" /> No Tax Payable
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => toast.info("PDF export coming soon")}
                    className="h-9 rounded-lg border border-border bg-card text-sm hover:bg-secondary">PDF</button>
                  <button onClick={() => toast.info("Excel export coming soon")}
                    className="h-9 rounded-lg border border-border bg-card text-sm hover:bg-secondary">Excel</button>
                </div>
                <button
                  disabled={caStatus !== "locked"}
                  onClick={() => toast.success("Company tax computation locked")}
                  className="mt-2 w-full h-10 rounded-lg bg-success text-success-foreground font-semibold text-sm disabled:opacity-50 hover:bg-success/90"
                >
                  Lock Company Tax
                </button>
              </div>
            </aside>
          </div>
        )}

        {caStatus === "locked" && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => toast.success("Tax liability recalculated")}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              <Calculator className="h-4 w-4" /> Compute Tax Liability
            </button>
            <button
              onClick={() => toast.info("Export coming soon")}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-sm hover:bg-secondary"
            >
              <FileText className="h-4 w-4" /> Export Computation
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function NumInput({ value, onChange, negative }: { value: number; onChange: (v: number) => void; negative?: boolean }) {
  return (
    <input
      type="number"
      value={value === 0 ? "" : value}
      placeholder="0"
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={cn(
        "mono w-40 text-right border-0 border-b border-border bg-transparent focus:outline-none focus:border-primary text-[13px] py-1",
        negative && "text-danger",
      )}
    />
  );
}

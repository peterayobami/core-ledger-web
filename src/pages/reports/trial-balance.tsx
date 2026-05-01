import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ReportKpi, ReportKpiStrip, PageCard } from "@/components/reports/ReportPrimitives";
import { YearSelect, PeriodSelect, periodLabel } from "@/components/reports/PeriodFilter";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/SearchInput";
import { Printer, FileSpreadsheet, ShieldCheck, Scale, Layers } from "lucide-react";
import { computeTrialBalance } from "@/lib/services/ledger.service";
import { defaultYear, type Period } from "@/lib/services/tax.service";
import { formatNGN } from "@/lib/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TrialBalancePage() {
  const [year, setYear] = useState<number>(defaultYear());
  const [period, setPeriod] = useState<Period>("full");
  const [search, setSearch] = useState("");

  // 🔌 BACKEND: Replace with `GET /api/reports/trial-balance?year=&period=`.
  const tb = useMemo(() => computeTrialBalance(year, period), [year, period]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tb.rows.filter(r => {
      if (r.closingDebit === 0 && r.closingCredit === 0 &&
          r.periodDebit === 0 && r.periodCredit === 0 &&
          r.openingDebit === 0 && r.openingCredit === 0) return false;
      if (!q) return true;
      return r.code.includes(q) || r.accountName.toLowerCase().includes(q);
    });
  }, [tb, search]);

  return (
    <AppShell title="Trial Balance">
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reports</div>
            <h1 className="text-xl font-semibold mt-1">Trial Balance</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Closing balances by account — {periodLabel(year, period)}.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <YearSelect value={year} onChange={setYear} />
            <PeriodSelect value={period} onChange={setPeriod} />
            <Button variant="outline" onClick={() => toast.info("Export coming soon")}>
              <Printer className="h-4 w-4 mr-1.5" /> Export
            </Button>
          </div>
        </header>

        <ReportKpiStrip>
          <ReportKpi label="Accounts With Activity" value={rows.length.toString()}
            hint="Excludes zero-balance accounts" icon={Layers} tone="primary" />
          <ReportKpi label="Total Debits" value={formatNGN(tb.totalClosingDebit)}
            hint="Closing Dr position" icon={FileSpreadsheet} tone="skyblue" />
          <ReportKpi label="Total Credits" value={formatNGN(tb.totalClosingCredit)}
            hint="Closing Cr position" icon={FileSpreadsheet} tone="warning" />
          <ReportKpi label="Status" value={tb.isBalanced ? "Balanced" : "Imbalanced"}
            hint={tb.isBalanced ? "Dr = Cr ✓" : `Δ ${formatNGN(tb.totalClosingDebit - tb.totalClosingCredit)}`}
            icon={tb.isBalanced ? ShieldCheck : Scale}
            tone={tb.isBalanced ? "success" : "danger"} />
        </ReportKpiStrip>

        <PageCard title="Trial Balance Statement">
          <div className="flex items-center gap-2 mb-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search account code or name…" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-strong">
                  <th rowSpan={2} className="text-left py-2 px-3 font-medium text-muted-foreground w-[80px] align-bottom">Code</th>
                  <th rowSpan={2} className="text-left py-2 px-3 font-medium text-muted-foreground align-bottom">Account</th>
                  <th colSpan={2} className="text-center py-1.5 px-3 font-semibold text-muted-foreground border-b border-border">Opening</th>
                  <th colSpan={2} className="text-center py-1.5 px-3 font-semibold text-muted-foreground border-b border-border">Period Movement</th>
                  <th colSpan={2} className="text-center py-1.5 px-3 font-semibold text-muted-foreground border-b border-border">Closing</th>
                </tr>
                <tr className="border-b border-border">
                  <th className="text-right py-1.5 px-3 font-medium text-muted-foreground fig text-[11px]">Dr</th>
                  <th className="text-right py-1.5 px-3 font-medium text-muted-foreground fig text-[11px]">Cr</th>
                  <th className="text-right py-1.5 px-3 font-medium text-muted-foreground fig text-[11px]">Dr</th>
                  <th className="text-right py-1.5 px-3 font-medium text-muted-foreground fig text-[11px]">Cr</th>
                  <th className="text-right py-1.5 px-3 font-medium text-muted-foreground fig text-[11px]">Dr</th>
                  <th className="text-right py-1.5 px-3 font-medium text-muted-foreground fig text-[11px]">Cr</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">No accounts match.</td></tr>
                )}
                {rows.map(r => (
                  <tr key={r.code} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-1.5 px-3 mono">{r.code}</td>
                    <td className="py-1.5 px-3">{r.accountName}</td>
                    <td className="py-1.5 px-3 mono text-right text-muted-foreground">{r.openingDebit > 0 ? formatNGN(r.openingDebit) : "—"}</td>
                    <td className="py-1.5 px-3 mono text-right text-muted-foreground">{r.openingCredit > 0 ? formatNGN(r.openingCredit) : "—"}</td>
                    <td className="py-1.5 px-3 mono text-right">{r.periodDebit > 0 ? formatNGN(r.periodDebit) : "—"}</td>
                    <td className="py-1.5 px-3 mono text-right">{r.periodCredit > 0 ? formatNGN(r.periodCredit) : "—"}</td>
                    <td className={cn("py-1.5 px-3 mono text-right font-semibold", r.closingDebit > 0 && "text-foreground")}>
                      {r.closingDebit > 0 ? formatNGN(r.closingDebit) : "—"}
                    </td>
                    <td className={cn("py-1.5 px-3 mono text-right font-semibold", r.closingCredit > 0 && "text-success")}>
                      {r.closingCredit > 0 ? formatNGN(r.closingCredit) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border-strong bg-secondary/40">
                  <td colSpan={2} className="py-2 px-3 font-semibold">Totals</td>
                  <td className="py-2 px-3 mono text-right font-semibold">{formatNGN(tb.totalOpeningDebit)}</td>
                  <td className="py-2 px-3 mono text-right font-semibold">{formatNGN(tb.totalOpeningCredit)}</td>
                  <td className="py-2 px-3 mono text-right font-semibold">{formatNGN(tb.totalPeriodDebit)}</td>
                  <td className="py-2 px-3 mono text-right font-semibold">{formatNGN(tb.totalPeriodCredit)}</td>
                  <td className="py-2 px-3 mono text-right font-semibold">{formatNGN(tb.totalClosingDebit)}</td>
                  <td className="py-2 px-3 mono text-right font-semibold text-success">{formatNGN(tb.totalClosingCredit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {!tb.isBalanced && (
            <div className="mt-4 p-3 rounded-lg border border-danger/30 bg-danger/5 text-[12.5px] text-danger">
              <Scale className="inline h-4 w-4 mr-1.5 -mt-0.5" />
              Trial Balance is out by <span className="mono font-semibold">{formatNGN(Math.abs(tb.totalClosingDebit - tb.totalClosingCredit))}</span>.
              Investigate journal posting integrity.
            </div>
          )}
        </PageCard>
      </div>
    </AppShell>
  );
}

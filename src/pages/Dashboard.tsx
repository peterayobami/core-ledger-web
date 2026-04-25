import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Link } from "react-router-dom";
import { useFY } from "@/context/fiscal-year";
import { getYear, formatNGN, totalAA, totalPoolCost, taxComputation, YEARS } from "@/lib/ca-data";
import { KpiCard } from "@/components/ca/KpiCard";
import { ArrowRight, Building2, Calculator, FileBarChart, Tag } from "lucide-react";
import { StatusBadge } from "@/components/ca/StatusBadge";

export default function Dashboard() {
  const { fiscalYear } = useFY();
  const year = getYear(fiscalYear)!;
  const t = taxComputation(year);

  return (
    <AppShell>
      <TopBar breadcrumbs={["Dashboard"]} />
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div>
          <h1 className="text-xl font-semibold">Welcome back, Olamide</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's an overview of your tax position for FY {fiscalYear}.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Gross Income" value={formatNGN(year.grossIncome)} sublabel={`Revenue · FY ${fiscalYear}`} />
          <KpiCard label="Adjusted Profit" value={formatNGN(t.adjustedProfit)} sublabel="After statutory adjustments" />
          <KpiCard label="Total Annual Allowance" value={formatNGN(totalAA(year))} sublabel="Capital allowance claimable" />
          <KpiCard label="CIT Payable (Estimate)" value={formatNGN(t.citPayable)} sublabel={`@ ${t.citRate}% · ${t.band} band`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Link to="/taxation/capital-allowance" className="data-card p-5 hover:shadow-elev transition-shadow group">
            <Building2 className="h-6 w-6 text-accent" />
            <div className="mt-3 font-semibold text-sm">Capital Allowance</div>
            <p className="text-xs text-muted-foreground mt-1">Review the schedule and pool depletion across all 11 asset classes.</p>
            <div className="mt-3 flex items-center gap-2"><StatusBadge status={year.status} /></div>
            <div className="mt-3 text-accent text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Open module <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
          <Link to="/taxation/tax-computation" className="data-card p-5 hover:shadow-elev transition-shadow group">
            <Calculator className="h-6 w-6 text-accent" />
            <div className="mt-3 font-semibold text-sm">Tax Computation</div>
            <p className="text-xs text-muted-foreground mt-1">Run the AY {year.assessmentYear} CIT computation with NTA 2025 bands.</p>
            <div className="mt-3 text-accent text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Open module <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
          <Link to="/assets/classifications" className="data-card p-5 hover:shadow-elev transition-shadow group">
            <Tag className="h-6 w-6 text-accent" />
            <div className="mt-3 font-semibold text-sm">Asset Classifications</div>
            <p className="text-xs text-muted-foreground mt-1">Browse statutory rates and useful lives for each asset class.</p>
            <div className="mt-3 text-accent text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              View reference <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>

        <div className="data-card overflow-hidden">
          <div className="border-b border-border px-5 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Recent Fiscal Years</h3>
              <p className="text-xs text-muted-foreground">Quick access to historical computations</p>
            </div>
            <Link to="/taxation/capital-allowance/history" className="text-xs text-accent font-medium inline-flex items-center gap-1">
              View history <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2.5">Fiscal Year</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-right px-4 py-2.5">Pool Cost</th>
                  <th className="text-right px-4 py-2.5">Annual Allowance</th>
                  <th className="text-right px-4 py-2.5">CIT Payable</th>
                </tr>
              </thead>
              <tbody>
                {[...YEARS].reverse().map((y) => {
                  const tt = y.status !== "not_computed" ? taxComputation(y) : null;
                  return (
                    <tr key={y.fiscalYear}>
                      <td className="px-4 py-2.5 font-mono font-medium">FY {y.fiscalYear}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={y.status} /></td>
                      <td className="fig px-4 py-2.5">{formatNGN(totalPoolCost(y))}</td>
                      <td className="fig px-4 py-2.5">{formatNGN(totalAA(y))}</td>
                      <td className="fig px-4 py-2.5 font-semibold">{tt ? formatNGN(tt.citPayable) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PAYELayout } from "@/components/paye/PAYELayout";
import { KpiCard } from "@/components/ca/KpiCard";
import { RunStatusBadge, RemittanceBadge } from "@/components/paye/RunStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Calculator, ShieldCheck, Lock, Search, ArrowRight, AlertTriangle,
  Download, ChevronDown,
} from "lucide-react";
import {
  RUNS, CURRENT_PERIOD, getRun, periodLong, periodShort, periodKey,
  formatNGN, formatNGNCompact, formatPct, validateForRun, prevPeriod,
} from "@/lib/paye-data";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function PayrollRuns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "computed" | "approved" | "locked">("all");

  const current = getRun(CURRENT_PERIOD);
  const prior = getRun(prevPeriod(CURRENT_PERIOD));
  const issues = useMemo(() => validateForRun(), []);

  const filteredRuns = [...RUNS].reverse().filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !periodLong(r.period).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grossDelta = current && prior ? current.totals.gross - prior.totals.gross : 0;
  const payeDelta = current && prior ? current.totals.paye - prior.totals.paye : 0;

  return (
    <PAYELayout breadcrumbs={["Taxation", "PAYE", "Payroll Runs"]}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Payroll Runs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compute, review and lock PAYE for each pay period.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5 mr-2" /> Export
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Calculator className="h-3.5 w-3.5 mr-2" /> New Payroll Run
          </Button>
        </div>
      </div>

      {/* Current period card */}
      {current && (
        <div className="data-card p-5">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Current Period</div>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-lg font-semibold">{periodLong(current.period)}</h2>
                <RunStatusBadge status={current.status} size="md" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {current.computedAt ? `Computed ${current.computedAt}` : "Awaiting computation"}
                {current.approvedAt && ` · Approved ${current.approvedAt}`}
                {current.lockedAt && ` · Locked by ${current.lockedBy} on ${current.lockedAt}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {current.status === "computed" && (
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Approve Run
                </Button>
              )}
              {current.status === "approved" && (
                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                  <Lock className="h-3.5 w-3.5 mr-2" /> Lock Run
                </Button>
              )}
              <Link to={`/taxation/paye/runs/${periodKey(current.period)}`}>
                <Button variant="outline" size="sm">
                  Open Run <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Gross Payroll"
              value={formatNGN(current.totals.gross)}
              sublabel={`${current.totals.headcount} employees`}
              trend={prior ? { delta: grossDelta, periodLabel: `vs ${periodShort(prevPeriod(CURRENT_PERIOD))}` } : undefined}
            />
            <KpiCard
              label="PAYE Withheld"
              value={formatNGN(current.totals.paye)}
              sublabel={`Avg ETR ${formatPct(current.totals.avgEtr)}`}
              trend={prior ? { delta: payeDelta, periodLabel: `vs ${periodShort(prevPeriod(CURRENT_PERIOD))}` } : undefined}
            />
            <KpiCard
              label="Pension + NHF"
              value={formatNGN(current.totals.pension + current.totals.nhf)}
              sublabel="Statutory deductions"
            />
            <KpiCard
              label="Net Pay"
              value={formatNGN(current.totals.net)}
              sublabel="To be disbursed"
            />
          </div>
        </div>
      )}

      {/* Validation issues */}
      {issues.length > 0 && (
        <div className="data-card p-5 border-l-4 border-l-warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Pre-flight checks</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {issues.filter(i => i.severity === "error").length} error(s) ·{" "}
                {issues.filter(i => i.severity === "warning").length} warning(s) before next run
              </p>
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-2">
                {issues.slice(0, 8).map((i, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      i.severity === "error" ? "bg-danger" : "bg-warning",
                    )} />
                    <Link to={`/taxation/paye/employees`} className="font-medium hover:text-accent">
                      {i.employeeName}
                    </Link>
                    <span className="text-muted-foreground">— {i.message}</span>
                  </div>
                ))}
                {issues.length > 8 && (
                  <div className="text-[11px] text-muted-foreground pl-3.5">
                    +{issues.length - 8} more issue(s)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run history */}
      <div className="data-card overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold">Run History</h3>
            <p className="text-xs text-muted-foreground">All payroll runs across periods</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search period…"
                className="h-8 w-48 pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                  <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["all", "computed", "approved", "locked"] as const).map(s => (
                  <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="capitalize">
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-2.5">Period</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">Headcount</th>
                <th className="text-right px-4 py-2.5">Gross</th>
                <th className="text-right px-4 py-2.5">PAYE</th>
                <th className="text-right px-4 py-2.5">Net</th>
                <th className="text-right px-4 py-2.5">ETR</th>
                <th className="text-left px-4 py-2.5">Remittance</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((r) => (
                <tr key={periodKey(r.period)}>
                  <td className="px-4 py-2.5 font-mono font-medium">{periodLong(r.period)}</td>
                  <td className="px-4 py-2.5"><RunStatusBadge status={r.status} /></td>
                  <td className="fig px-4 py-2.5">{r.totals.headcount}</td>
                  <td className="fig px-4 py-2.5">{formatNGNCompact(r.totals.gross)}</td>
                  <td className="fig px-4 py-2.5 font-semibold">{formatNGNCompact(r.totals.paye)}</td>
                  <td className="fig px-4 py-2.5">{formatNGNCompact(r.totals.net)}</td>
                  <td className="fig px-4 py-2.5">{formatPct(r.totals.avgEtr)}</td>
                  <td className="px-4 py-2.5">
                    {r.remittance ? <RemittanceBadge status={r.remittance.status} /> : <span className="text-[11px] text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      to={`/taxation/paye/runs/${periodKey(r.period)}`}
                      className="text-xs text-accent font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredRuns.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No runs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PAYELayout>
  );
}

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PAYELayout } from "@/components/paye/PAYELayout";
import { KpiCard } from "@/components/ca/KpiCard";
import { RemittanceBadge } from "@/components/paye/RunStatusBadge";
import { Button } from "@/components/ui/button";
import {
  RUNS, periodKey, periodLong, formatNGN, formatNGNCompact, CURRENT_PERIOD,
} from "@/lib/paye-data";
import { ArrowRight, FileText, Send } from "lucide-react";

export default function Remittance() {
  const remittances = useMemo(() => {
    return [...RUNS]
      .filter(r => r.remittance)
      .sort((a, b) => periodKey(b.period).localeCompare(periodKey(a.period)));
  }, []);

  const stats = useMemo(() => {
    const ytdSubmitted = remittances
      .filter(r => r.period.year === CURRENT_PERIOD.year && r.remittance!.status === "submitted")
      .reduce((s, r) => s + r.remittance!.amount, 0);
    const pending = remittances.filter(r => r.remittance!.status === "pending" || r.remittance!.status === "overdue");
    const overdue = remittances.filter(r => r.remittance!.status === "overdue");
    const onTimeRate = (() => {
      const submitted = remittances.filter(r => r.remittance!.status === "submitted");
      if (submitted.length === 0) return 100;
      const onTime = submitted.filter(r => {
        if (!r.remittance!.submittedDate) return false;
        return new Date(r.remittance!.submittedDate) <= new Date(r.remittance!.dueDate);
      }).length;
      return (onTime / submitted.length) * 100;
    })();
    return {
      ytdSubmitted,
      pendingCount: pending.length,
      pendingAmount: pending.reduce((s, r) => s + r.remittance!.amount, 0),
      overdueCount: overdue.length,
      onTimeRate,
    };
  }, [remittances]);

  return (
    <PAYELayout breadcrumbs={["Taxation", "PAYE", "Remittance"]}>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Remittance Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            PAYE remittances to FIRS. Statutory due date is 10th of the following month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-3.5 w-3.5 mr-2" /> Export Schedule
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="h-3.5 w-3.5 mr-2" /> Mark as Submitted
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="YTD Remitted" value={formatNGN(stats.ytdSubmitted)} sublabel={`FY ${CURRENT_PERIOD.year}`} />
        <KpiCard
          label="Pending"
          value={stats.pendingCount}
          sublabel={stats.pendingAmount > 0 ? `${formatNGNCompact(stats.pendingAmount)} due` : "All clear"}
        />
        <KpiCard
          label="Overdue"
          value={stats.overdueCount}
          sublabel={stats.overdueCount > 0 ? "Action required" : "None"}
        />
        <KpiCard
          label="On-time rate"
          value={`${stats.onTimeRate.toFixed(0)}%`}
          sublabel="Submitted by due date"
          progress={{ pct: stats.onTimeRate }}
        />
      </div>

      <div className="data-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">Remittance Schedule</h3>
          <p className="text-xs text-muted-foreground">All locked payroll runs and their FIRS submission status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-2.5">Period</th>
                <th className="text-right px-4 py-2.5">Amount</th>
                <th className="text-left px-4 py-2.5">Due Date</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5">Submitted</th>
                <th className="text-left px-4 py-2.5">Payment Ref</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {remittances.map(r => {
                const rem = r.remittance!;
                return (
                  <tr key={periodKey(r.period)}>
                    <td className="px-4 py-2.5 font-mono font-medium">{periodLong(r.period)}</td>
                    <td className="fig px-4 py-2.5 font-semibold">{formatNGN(rem.amount)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{rem.dueDate}</td>
                    <td className="px-4 py-2.5"><RemittanceBadge status={rem.status} /></td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {rem.submittedDate ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {rem.paymentRef ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        to={`/taxation/paye/runs/${periodKey(r.period)}`}
                        className="text-xs text-accent font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Run <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {remittances.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No remittances yet. Lock a payroll run to schedule its remittance.
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

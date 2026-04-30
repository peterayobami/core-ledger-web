import { AppShell } from "@/components/layout/AppShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { Construction } from "lucide-react";

export default function TrialBalancePage() {
  return (
    <AppShell title="Trial Balance">
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <header>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reports</div>
          <h1 className="text-xl font-semibold mt-1">Trial Balance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Closing balances by account for the selected period.</p>
        </header>
        <PageCard>
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <Construction className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Trial Balance page is queued — backed by <code className="mx-1 mono text-[12px]">computeTrialBalance(year, period)</code>.
            </p>
          </div>
        </PageCard>
      </div>
    </AppShell>
  );
}

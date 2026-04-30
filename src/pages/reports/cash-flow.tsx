import { AppShell } from "@/components/layout/AppShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { Construction } from "lucide-react";

export default function CashFlowPage() {
  return (
    <AppShell title="Cash Flow Statement">
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <header>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reports</div>
          <h1 className="text-xl font-semibold mt-1">Cash Flow Statement</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Indirect method — Operating, Investing, Financing.</p>
        </header>
        <PageCard>
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <Construction className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Cash Flow page is queued — backed by <code className="mx-1 mono text-[12px]">computeCashFlow(year, inputs)</code>.
            </p>
          </div>
        </PageCard>
      </div>
    </AppShell>
  );
}

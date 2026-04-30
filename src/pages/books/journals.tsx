import { AppShell } from "@/components/layout/AppShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { Construction } from "lucide-react";

export default function JournalsPage() {
  return (
    <AppShell title="General Journal">
      <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <header>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Books</div>
          <h1 className="text-xl font-semibold mt-1">General Journal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All accounting entries for the period.</p>
        </header>
        <PageCard>
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <Construction className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground max-w-md">
              Journals page is being built next. The ledger service is ready —
              <code className="mx-1 mono text-[12px]">generateJournals(year)</code>
              already produces auto-generated entries for every Revenue, Purchase, Expense,
              Asset and Depreciation transaction.
            </p>
          </div>
        </PageCard>
      </div>
    </AppShell>
  );
}

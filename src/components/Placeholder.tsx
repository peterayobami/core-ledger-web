import { TopBar } from "@/components/layout/TopBar";
import { Construction } from "lucide-react";

export default function Placeholder({ title, breadcrumbs }: { title: string; breadcrumbs: string[] }) {
  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
        <div className="data-card p-12 flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="h-12 w-12 rounded-full bg-accent-soft text-accent grid place-items-center mb-4">
            <Construction className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            This module is part of the broader Bechellente Ledger Suite. The Capital Allowance and Tax Computation modules are fully built — explore them from the sidebar.
          </p>
        </div>
      </main>
    </>
  );
}

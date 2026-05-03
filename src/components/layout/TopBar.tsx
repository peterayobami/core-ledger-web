import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown, Bell, HelpCircle, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFiscalYearStore } from "@/stores/fiscal-year.store";
import { YEARS, CURRENT_FY } from "@/lib/mock-data/ca";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getRouteTitle } from "./AppShell";

const ORG_SETTINGS_RETURN_KEY = "org-settings-return";

function statusBadge(status: string, isCurrent: boolean) {
  if (isCurrent) return <span className="text-[10px] text-accent font-medium">(Current)</span>;
  if (status === "locked") return <span className="text-[10px] text-success font-medium">(Locked)</span>;
  if (status === "computed") return <span className="text-[10px] text-warning font-medium">(Pending Lock)</span>;
  return <span className="text-[10px] text-muted-foreground">(Not Computed)</span>;
}

export function TopBar({ title, breadcrumbs }: { title?: string; breadcrumbs?: string[] }) {
  const router = useRouter();
  const { fiscalYear, setFiscalYear } = useFiscalYearStore();
  const pageTitle = title || getRouteTitle(router.pathname);

  return (
    <header
      className="sticky top-0 z-20 h-[60px] flex items-center px-5 shrink-0"
      style={{ backgroundColor: "var(--cl-header-bg, #EFEFEF)" }}
    >
      {/* Back / Forward */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-md hover:bg-white/60 text-[var(--cl-text-muted)]"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => globalThis.history.forward()}
          className="p-1.5 rounded-md hover:bg-white/60 text-[var(--cl-text-muted)]"
          aria-label="Forward"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Title — left-aligned next to nav buttons */}
      <h1
        className="ml-3 font-semibold truncate"
        style={{ color: "#333333", fontSize: 16 }}
      >
        {pageTitle}
      </h1>

      {/* Right side: tenant + FY + icons + avatar */}
      <div className="ml-auto flex items-center gap-3">
        {/* Tenant — clickable, navigates to Organisation Settings */}
        <Link href="/settings/org/company" onClick={() => sessionStorage.setItem(ORG_SETTINGS_RETURN_KEY, window.location.pathname)} className="hidden xl:flex items-center gap-2 rounded-md border border-[var(--cl-border)] px-3 py-1.5 bg-white/60 hover:bg-white/80 transition-colors cursor-pointer">
          <div className="h-6 w-6 rounded bg-[var(--cl-primary)] text-white grid place-items-center text-[11px] font-semibold">AC</div>
          <div className="leading-tight">
            <div className="text-xs font-medium text-[var(--cl-text)]">Acme Industries Ltd</div>
            <div className="text-[10px] text-[var(--cl-text-muted)]">Tenant ID: ACM-2025</div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--cl-text-muted)]" />
        </Link>

        {/* FY selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="font-mono bg-white/60">
              FY {fiscalYear}
              <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Select Fiscal Year</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[...YEARS].reverse().map((y) => (
              <DropdownMenuItem
                key={y.fiscalYear}
                onClick={() => setFiscalYear(y.fiscalYear)}
                className={cn("flex items-center justify-between", y.fiscalYear === fiscalYear && "bg-accent-soft")}
              >
                <span className="font-mono">FY {y.fiscalYear}</span>
                {statusBadge(y.status, y.fiscalYear === CURRENT_FY)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="p-2 rounded-md hover:bg-white/60 text-[var(--cl-text-muted)]" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="p-2 rounded-md hover:bg-white/60 text-[var(--cl-text-muted)]" aria-label="Help">
          <HelpCircle size={18} />
        </button>
        <div className="h-8 w-8 rounded-full bg-[var(--cl-primary)] text-white grid place-items-center text-xs font-semibold">
          OA
        </div>
      </div>
    </header>
  );
}

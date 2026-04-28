import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard, Settings, FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFiscalYearStore } from "@/stores/fiscal-year.store";
import { caRepository } from "@/lib/repositories/ca.repository";
import { payeRepository } from "@/lib/repositories/paye.repository";

type NavRow =
  | { kind: "item"; label: string; to: string; statusKey?: "ca" | "tax" | "paye" | "vat" | "wht"; icon?: any }
  | { kind: "label"; label: string };

const NAV: NavRow[] = [
  { kind: "item", label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },

  { kind: "label", label: "Contacts" },
  { kind: "item", label: "Vendors", to: "/contacts/vendors" },
  { kind: "item", label: "Customers", to: "/contacts/customers" },
  { kind: "item", label: "Employees", to: "/contacts/employees" },

  { kind: "label", label: "Reports" },
  { kind: "item", label: "Profit and Loss", to: "/reports/profit-and-loss" },
  { kind: "item", label: "Balance Sheet", to: "/reports/balance-sheet" },
  { kind: "item", label: "Cash Flow", to: "/reports/cash-flow" },
  { kind: "item", label: "Trial Balance", to: "/reports/trial-balance" },

  { kind: "label", label: "Books" },
  { kind: "item", label: "Charts of Accounts", to: "/books/charts-of-accounts" },
  { kind: "item", label: "Journals", to: "/books/journals" },

  { kind: "label", label: "Transactions" },
  { kind: "item", label: "Assets", to: "/transactions/assets" },
  { kind: "item", label: "Purchases", to: "/transactions/purchases" },
  { kind: "item", label: "Revenue", to: "/transactions/revenue" },
  { kind: "item", label: "Expenses", to: "/transactions/expenses" },

  { kind: "label", label: "Taxation" },
  { kind: "item", label: "Capital Allowance", to: "/taxation/capital-allowance", statusKey: "ca" },
  { kind: "item", label: "Tax Computation", to: "/taxation/tax-computation", statusKey: "tax" },
  { kind: "item", label: "PAYE", to: "/taxation/paye", statusKey: "paye" },
  { kind: "item", label: "VAT", to: "/taxation/vat", statusKey: "vat" },
  { kind: "item", label: "WHT", to: "/taxation/wht", statusKey: "wht" },

  { kind: "item", label: "Reports", to: "/reports", icon: FileBarChart },
  { kind: "item", label: "Settings", to: "/settings", icon: Settings },
];

function StatusDot({ kind }: { kind: "gray" | "amber" | "green" }) {
  const cls = {
    gray: "bg-sidebar-foreground/30",
    amber: "bg-warning",
    green: "bg-success",
  }[kind];
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", cls)} />;
}

function useStatusFor(key?: "ca" | "tax" | "paye" | "vat" | "wht"): "gray" | "amber" | "green" {
  const { fiscalYear } = useFiscalYearStore();
  const y = caRepository.getByFiscalYear(fiscalYear);
  if (!key) return "gray";
  if (key === "ca") {
    if (!y) return "gray";
    return y.status === "locked" ? "green" : y.status === "computed" ? "amber" : "gray";
  }
  if (key === "tax") {
    return y?.citPayable !== undefined && y.status === "locked" ? "green" : "gray";
  }
  if (key === "paye") {
    const currentPeriod = payeRepository.getCurrentPeriod();
    const r = payeRepository.getRunByPeriod(currentPeriod);
    if (!r || r.status === "no_run") return "gray";
    if (r.status === "locked") return "green";
    return "amber";
  }
  return "gray";
}

function SidebarItem({ row }: { row: Extract<NavRow, { kind: "item" }> }) {
  const status = useStatusFor(row.statusKey);
  const Icon = row.icon;
  const { pathname } = useRouter();
  const isActive = row.to === "/dashboard"
    ? pathname === "/dashboard" || pathname === "/"
    : pathname.startsWith(row.to);
  return (
    <Link
      href={row.to}
      className={cn(
        "group relative flex items-center gap-2 rounded-md pl-3 pr-2 py-1.5 text-[13px] transition-colors",
        isActive
          ? "bg-accent-soft text-accent font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r-full bg-accent" />
      )}
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
      <span className="flex-1 truncate">{row.label}</span>
      {row.statusKey && <StatusDot kind={status} />}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground font-semibold">
          B
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">Bechellente</div>
          <div className="text-[11px] text-sidebar-foreground/70">Ledger Suite</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-px">
        {NAV.map((row, i) => {
          if (row.kind === "label") {
            return (
              <div
                key={`l-${i}`}
                className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45"
              >
                {row.label}
              </div>
            );
          }
          return <SidebarItem key={row.to} row={row} />;
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3 text-[11px] text-sidebar-foreground/60 shrink-0">
        v1.0 · NTA 2025
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}

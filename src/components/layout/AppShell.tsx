import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Building2, UserCircle2, Users,
  LineChart, Sheet, Repeat, FileSpreadsheet,
  FolderOpen, BookOpenText,
  Package, ShoppingCart, TrendingUp, Receipt,
  Calculator, Banknote, Percent, FileBarChart, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

type NavRow =
  | { kind: "item"; label: string; to: string; icon: any }
  | { kind: "label"; label: string };

const NAV: NavRow[] = [
  { kind: "item", label: "Dashboard", to: "/", icon: LayoutGrid },

  { kind: "label", label: "Contacts" },
  { kind: "item", label: "Vendors",   to: "/contacts/vendors",   icon: Building2 },
  { kind: "item", label: "Customers", to: "/contacts/customers", icon: UserCircle2 },
  { kind: "item", label: "Employees", to: "/contacts/employees", icon: Users },

  { kind: "label", label: "Reports" },
  { kind: "item", label: "Profit and Loss", to: "/reports/profit-and-loss", icon: LineChart },
  { kind: "item", label: "Balance Sheet",   to: "/reports/balance-sheet",   icon: Sheet },
  { kind: "item", label: "Cash Flow",       to: "/reports/cash-flow",       icon: Repeat },
  { kind: "item", label: "Trial Balance",   to: "/reports/trial-balance",   icon: FileSpreadsheet },

  { kind: "label", label: "Books" },
  { kind: "item", label: "Charts of Account", to: "/books/charts-of-accounts", icon: FolderOpen },
  { kind: "item", label: "Journals",          to: "/books/journals",           icon: BookOpenText },

  { kind: "label", label: "Transactions" },
  { kind: "item", label: "Assets",    to: "/transactions/assets",    icon: Package },
  { kind: "item", label: "Purchases", to: "/transactions/purchases", icon: ShoppingCart },
  { kind: "item", label: "Revenue",   to: "/transactions/revenue",   icon: TrendingUp },
  { kind: "item", label: "Expenses",  to: "/transactions/expenses",  icon: Receipt },

  { kind: "label", label: "Taxation" },
  { kind: "item", label: "Capital Allowance", to: "/taxation/capital-allowance", icon: Calculator },
  { kind: "item", label: "Payroll",           to: "/taxation/paye",              icon: Banknote },
  { kind: "item", label: "VAT Computation",   to: "/taxation/vat",               icon: Percent },
  { kind: "item", label: "WHT",               to: "/taxation/wht",               icon: FileBarChart },

  { kind: "item", label: "Settings", to: "/settings", icon: Settings },
];

function SidebarItem({ row }: { row: Extract<NavRow, { kind: "item" }> }) {
  const Icon = row.icon;
  return (
    <NavLink
      to={row.to}
      end={row.to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors",
          isActive
            ? "text-primary font-semibold"
            : "text-[#6A7282] hover:text-primary",
        )
      }
      style={({ isActive }) =>
        isActive
          ? {
              background: "rgba(24,79,151,0.12)",
              border: "0.5px solid rgba(24,79,151,0.59)",
            }
          : undefined
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : "text-[#6A7282]")} />
          <span className="flex-1 truncate">{row.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside
      className="hidden md:flex flex-col bg-card relative shrink-0"
      style={{ width: 250, boxShadow: "var(--shadow-sidebar)" }}
    >
      {/* Fixed logo header */}
      <div
        className="absolute top-0 left-0 right-0 z-10 bg-card flex items-end gap-2 px-4 pb-2 pt-3"
        style={{ height: 60 }}
      >
        <img src={logo} alt="Core Ledger" className="h-7 w-auto" style={{ width: 35 }} />
        <div className="leading-none flex items-baseline gap-1">
          <span className="text-[20px] font-bold" style={{ color: "#184F97" }}>Core</span>
          <span className="text-[20px] font-bold" style={{ color: "#004A7E" }}>Ledger</span>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav
        className="flex-1 overflow-y-auto scrollbar-hidden"
        style={{ paddingTop: 73, paddingLeft: 13, paddingRight: 13, paddingBottom: 13 }}
      >
        <div className="space-y-1">
          {NAV.map((row, i) => {
            if (row.kind === "label") {
              return (
                <div
                  key={`l-${i}`}
                  className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#666666]"
                >
                  {row.label}
                </div>
              );
            }
            return <SidebarItem key={row.to} row={row} />;
          })}
        </div>
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

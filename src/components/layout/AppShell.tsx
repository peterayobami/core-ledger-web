import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Building2, UserCircle2, Users,
  Boxes, ShoppingCart, TrendingUp, Receipt as ReceiptIcon,
  Calculator, Wallet, Percent, FileText, Landmark,
  PieChart, Scale, ArrowDownUp, FileSpreadsheet,
  Network, BookOpen,
  ChevronLeft, ChevronRight, Bell, HelpCircle,
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

  { kind: "label", label: "Transactions" },
  { kind: "item", label: "Assets",    to: "/transactions/assets",    icon: Boxes },
  { kind: "item", label: "Purchases", to: "/transactions/purchases", icon: ShoppingCart },
  { kind: "item", label: "Revenue",   to: "/transactions/revenue",   icon: TrendingUp },
  { kind: "item", label: "Expenses",  to: "/transactions/expenses",  icon: ReceiptIcon },

  { kind: "label", label: "Taxation" },
  { kind: "item", label: "Capital Allowance", to: "/taxation/capital-allowance", icon: Calculator },
  { kind: "item", label: "Payroll",           to: "/taxation/paye",              icon: Wallet },
  { kind: "item", label: "VAT Computation",   to: "/taxation/vat",               icon: Percent },
  { kind: "item", label: "WHT",               to: "/taxation/wht",               icon: FileText },
  { kind: "item", label: "Income Taxes",      to: "/taxation/income-taxes",      icon: Landmark },

  { kind: "label", label: "Reports" },
  { kind: "item", label: "Profit and Loss", to: "/reports/profit-and-loss", icon: PieChart },
  { kind: "item", label: "Balance Sheet",   to: "/reports/balance-sheet",   icon: Scale },
  { kind: "item", label: "Cash Flow",       to: "/reports/cash-flow",       icon: ArrowDownUp },
  { kind: "item", label: "Trial Balance",   to: "/reports/trial-balance",   icon: FileSpreadsheet },

  { kind: "label", label: "Books" },
  { kind: "item", label: "Charts of Account", to: "/books/charts-of-accounts", icon: Network },
  { kind: "item", label: "Journals",          to: "/books/journals",           icon: BookOpen },
];

function SidebarItem({ row }: { row: Extract<NavRow, { kind: "item" }> }) {
  const Icon = row.icon;
  return (
    <NavLink
      to={row.to}
      end={row.to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
          isActive
            ? "text-primary font-semibold bg-primary/10"
            : "text-[#6A7282] hover:text-primary hover:bg-primary/5",
        )
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
      className="hidden md:flex flex-col bg-card shrink-0 border-r border-border h-screen sticky top-0"
      style={{ width: 250 }}
    >
      {/* Logo header — matches TopBar height */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border shrink-0">
        <img
          src={logo}
          alt="Core Ledger"
          className="h-7 w-auto object-contain"
        />
        <div className="leading-none flex items-baseline gap-1">
          <span className="text-[18px] font-bold" style={{ color: "#184F97" }}>Core</span>
          <span className="text-[18px] font-bold" style={{ color: "#004A7E" }}>Ledger</span>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-hidden p-3">
        <div className="space-y-0.5">
          {NAV.map((row, i) => {
            if (row.kind === "label") {
              return (
                <div
                  key={`l-${i}`}
                  className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#999999]"
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

export function AppTopBar({ title }: { title?: string }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 h-14 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate(-1)}
          className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          aria-label="Forward"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <h1 className="flex-1 text-center text-[15px] font-semibold text-foreground truncate">
        {title ?? "Core Ledger"}
      </h1>
      <div className="flex items-center gap-1">
        <button className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary">
          <Bell className="h-4 w-4" />
        </button>
        <button className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppTopBar title={title} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

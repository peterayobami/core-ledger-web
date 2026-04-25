import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Receipt, Boxes, Calculator, FileBarChart, Settings,
  ChevronRight, Building2, ShoppingCart, FileText, Layers, Tag, BarChart3,
  Banknote, Percent, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFY } from "@/context/fiscal-year";
import { getYear } from "@/lib/ca-data";

type Item = { label: string; to: string; icon?: any; statusKey?: "ca" | "tax" | "paye" | "vat" | "wht" };
type Group = { label: string; icon: any; items?: Item[]; to?: string };

const NAV: Group[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  {
    label: "Transactions", icon: Receipt, items: [
      { label: "Revenue", to: "/transactions/revenue", icon: Banknote },
      { label: "Purchases", to: "/transactions/purchases", icon: ShoppingCart },
      { label: "Expenses", to: "/transactions/expenses", icon: Wallet },
    ],
  },
  {
    label: "Assets", icon: Boxes, items: [
      { label: "Asset Register", to: "/assets/register", icon: Layers },
      { label: "Asset Classifications", to: "/assets/classifications", icon: Tag },
    ],
  },
  {
    label: "Taxation", icon: Calculator, items: [
      { label: "Capital Allowance", to: "/taxation/capital-allowance", icon: Building2, statusKey: "ca" },
      { label: "Tax Computation", to: "/taxation/tax-computation", icon: FileText, statusKey: "tax" },
      { label: "PAYE", to: "/taxation/paye", icon: Percent, statusKey: "paye" },
      { label: "VAT", to: "/taxation/vat", icon: Percent, statusKey: "vat" },
      { label: "WHT", to: "/taxation/wht", icon: Percent, statusKey: "wht" },
    ],
  },
  { label: "Reports", icon: FileBarChart, to: "/reports" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

function StatusDot({ kind }: { kind: "gray" | "amber" | "green" }) {
  const cls = {
    gray: "bg-muted-foreground/40",
    amber: "bg-warning",
    green: "bg-success",
  }[kind];
  return <span className={cn("status-dot ring-2 ring-sidebar-background", cls)} />;
}

function useStatusFor(key?: Item["statusKey"]): "gray" | "amber" | "green" {
  const { fiscalYear } = useFY();
  const y = getYear(fiscalYear);
  if (!y || !key) return "gray";
  if (key === "ca") {
    return y.status === "locked" ? "green" : y.status === "computed" ? "amber" : "gray";
  }
  if (key === "tax") {
    return y.citPayable !== undefined && y.status === "locked" ? "green" : "gray";
  }
  return "gray";
}

function NavGroup({ group, defaultOpen }: { group: Group; defaultOpen?: boolean }) {
  const location = useLocation();
  const isActiveTop = group.to && location.pathname === group.to;

  if (group.to && !group.items) {
    return (
      <NavLink
        to={group.to}
        end
        className={({ isActive }) => cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <group.icon className="h-4 w-4 shrink-0" />
        <span>{group.label}</span>
      </NavLink>
    );
  }

  const containsActive = group.items?.some((i) => location.pathname.startsWith(i.to));
  const open = defaultOpen || containsActive || isActiveTop;

  return (
    <details open={open} className="group/det">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground">
        <group.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{group.label}</span>
        <ChevronRight className="h-4 w-4 transition-transform group-open/det:rotate-90" />
      </summary>
      <ul className="mt-1 space-y-0.5 pl-9">
        {group.items?.map((item) => (
          <li key={item.to}>
            <NavItem item={item} />
          </li>
        ))}
      </ul>
    </details>
  );
}

function NavItem({ item }: { item: Item }) {
  const status = useStatusFor(item.statusKey);
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <span className="flex-1">{item.label}</span>
      {item.statusKey && <StatusDot kind={status} />}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground font-semibold">
          B
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">Bechellente</div>
          <div className="text-[11px] text-sidebar-foreground/70">Ledger Suite</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map((g) => (
          <NavGroup key={g.label} group={g} defaultOpen={g.label === "Taxation"} />
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3 text-[11px] text-sidebar-foreground/60">
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

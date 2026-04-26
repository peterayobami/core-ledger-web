import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Payroll Runs", to: "/taxation/paye" },
  { label: "Employees", to: "/taxation/paye/employees" },
  { label: "Remittance", to: "/taxation/paye/remittance" },
  { label: "Tax Bands", to: "/taxation/paye/bands" },
];

export function PAYETabs() {
  const { pathname } = useLocation();
  return (
    <div className="border-b border-border bg-card">
      <div className="px-6 flex items-center gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const active = pathname === t.to || (t.to === "/taxation/paye" && pathname.startsWith("/taxation/paye/runs/"));
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-t-full" />}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

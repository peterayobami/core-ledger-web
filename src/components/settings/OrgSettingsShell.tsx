import { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
    Building2, Calendar, Wallet, Percent, Users2, Plug, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrgSettings } from "@/stores/org-settings.store";

const ORG_NAV = [
    { label: "Company Profile", to: "/settings/org/company", icon: Building2 },
    { label: "Fiscal Years", to: "/settings/org/fiscal-years", icon: Calendar },
    { label: "Opening Balances", to: "/settings/org/opening-balances", icon: Wallet },
    { label: "Tax Configuration", to: "/settings/org/tax-config", icon: Percent },
    { label: "Users & Permissions", to: "/settings/org/users", icon: Users2 },
    { label: "Integrations", to: "/settings/org/integrations", icon: Plug },
];

function OrgSidebar() {
    const router = useRouter();
    const company = useOrgSettings(s => s.company);
    return (
        <aside
            className="hidden md:flex flex-col bg-white relative shrink-0 z-30"
            style={{ width: 250, boxShadow: "3px 0 8px rgba(51,51,51,0.059)" }}
        >
            {/* Org logo + name (mirrors main app sidebar header) */}
            <div className="h-[60px] px-4 flex items-center gap-2 border-b border-[var(--cl-border)]/70 shrink-0">
                <div className="w-9 h-9 rounded-lg bg-[var(--cl-primary)] flex items-center justify-center text-white shrink-0">
                    <Building2 size={20} strokeWidth={2.2} />
                </div>
                <div className="leading-none">
                    <div className="text-[14px] font-semibold tracking-tight truncate max-w-[160px]">
                        {company.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Organisation Settings</div>
                </div>
            </div>

            {/* Scrollable menu */}
            <nav className="flex-1 overflow-y-auto scrollbar-hidden px-[13px] pt-[13px] pb-[24px]">
                <div className="flex flex-col" style={{ gap: 20 }}>
                    <div>
                        <div
                            className="px-2.5 mb-1.5 uppercase text-[11px] font-semibold"
                            style={{ color: "#9D9D9D", letterSpacing: "0.04em" }}
                        >
                            Configuration
                        </div>
                        <div className="flex flex-col" style={{ gap: 4 }}>
                            {ORG_NAV.map(row => {
                                const Icon = row.icon;
                                const isActive = router.pathname === row.to;
                                return (
                                    <Link
                                        key={row.to}
                                        href={row.to}
                                        className={cn(
                                            "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors duration-150",
                                            isActive
                                                ? "text-[var(--cl-primary)]"
                                                : "text-[var(--cl-text-muted)] hover:bg-[rgba(24,79,151,0.06)]"
                                        )}
                                        style={
                                            isActive
                                                ? {
                                                    backgroundColor: "rgba(24,79,151,0.10)",
                                                    border: "0.5px solid rgba(24,79,151,0.50)",
                                                }
                                                : { border: "0.5px solid transparent" }
                                        }
                                    >
                                        <Icon size={18} strokeWidth={1.8} />
                                        <span className="font-medium">{row.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
}

const RETURN_KEY = "org-settings-return";

function OrgTopBar() {
    const router = useRouter();
    return (
        <header
            className="sticky top-0 z-30 h-14 border-b border-border flex items-center px-4 gap-3 shrink-0"
            style={{ background: "hsl(var(--secondary))" }}
        >
            <button
                onClick={() => { const p = sessionStorage.getItem(RETURN_KEY) || "/"; sessionStorage.removeItem(RETURN_KEY); router.push(p); }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium text-primary hover:bg-primary/10"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Core Ledger
            </button>
            <div className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                <span className="text-border-strong">/</span>
                <span className="font-medium text-foreground">Organisation Settings</span>
            </div>
            <div className="ml-auto text-[11px] uppercase tracking-wider font-semibold text-warning">
                Configuration Mode
            </div>
        </header>
    );
}

export function OrgSettingsShell({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <OrgSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <OrgTopBar />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-[1200px] w-full mx-auto">
                        <div className="mb-6">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Organisation Settings
                            </div>
                            <h1 className="text-xl font-semibold mt-1">{title}</h1>
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

import { OrgSettingsShell } from "@/components/settings/OrgSettingsShell";
import { PageCard, SectionHeading } from "@/components/reports/ReportPrimitives";
import { useOrgSettings } from "@/stores/org-settings.store";
import type { OpeningBalance } from "@/stores/org-settings.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Lock } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { COA_ACCOUNTS, isHeaderAccount } from "@/lib/mock-data/coa";
import { formatNGN } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

/**
 * Named opening balance accounts and their COA normal balance.
 * Debit-normal accounts: positive amount = debit entry.
 * Credit-normal accounts: positive amount = credit entry.
 * Retained Earnings B/F is special: positive = credit (profit); negative = debit (accumulated loss).
 */
const NAMED: Array<{
    key: keyof OpeningBalance;
    label: string;
    account: string;
    normalBalance: "Debit" | "Credit";
    hint: string;
    section: string;
}> = [
    { key: "openingCash",        label: "Cash & Bank",                     account: "1100", normalBalance: "Debit",  hint: "Aggregate bank and petty cash balance.",                           section: "Assets" },
    { key: "accountsReceivable", label: "Accounts Receivable",             account: "1200", normalBalance: "Debit",  hint: "Total amounts owed to you by customers.",                          section: "Assets" },
    { key: "whtReceivable",      label: "WHT Receivable",                   account: "1250", normalBalance: "Debit",  hint: "WHT credits from customers, available against CIT assessment.",   section: "Assets" },
    { key: "accountsPayable",    label: "Accounts Payable",                 account: "2100", normalBalance: "Credit", hint: "Total amounts owed to suppliers and vendors.",                     section: "Liabilities" },
    { key: "shareCapital",       label: "Share Capital",                    account: "3100", normalBalance: "Credit", hint: "Issued and paid-up share capital.",                                section: "Equity" },
    { key: "retainedEarningsBF", label: "Retained Earnings / (Loss) B/F",  account: "3200", normalBalance: "Credit", hint: "Closing retained earnings of the prior year. Enter negative for accumulated losses.", section: "Equity" },
];

export default function OpeningBalancesPage() {
    const fiscalYears = useOrgSettings(s => s.fiscalYears);
    const openingBalances = useOrgSettings(s => s.openingBalances);
    const setOpeningBalance = useOrgSettings(s => s.setOpeningBalance);
    const addCustomOpeningRow = useOrgSettings(s => s.addCustomOpeningRow);
    const removeCustomOpeningRow = useOrgSettings(s => s.removeCustomOpeningRow);

    const [activeYear, setActiveYear] = useState<number>(
        fiscalYears.find(y => y.status === "active")?.year ?? fiscalYears[0]?.year ?? new Date().getFullYear()
    );
    const fy = fiscalYears.find(y => y.year === activeYear);
    const isClosed = fy?.status === "closed";
    const ob = openingBalances[activeYear] ?? {
        openingCash: 0, accountsReceivable: 0, whtReceivable: 0,
        shareCapital: 0, retainedEarningsBF: 0, accountsPayable: 0, customRows: [],
    };

    const [newAcct, setNewAcct] = useState("");
    const [newAmt, setNewAmt] = useState(0);

    /** Trial balance check — every opening position must balance (Debits = Credits). */
    const { totalDr, totalCr, diff } = useMemo(() => {
        let dr = 0;
        let cr = 0;

        for (const field of NAMED) {
            const val = ob[field.key] as number;
            if (field.normalBalance === "Debit") {
                if (val >= 0) dr += val; else cr += Math.abs(val);
            } else {
                // Credit-normal — positive = credit, negative = debit (e.g. accumulated loss)
                if (val >= 0) cr += val; else dr += Math.abs(val);
            }
        }

        // Custom rows — look up normalBalance from COA
        for (const row of ob.customRows) {
            const acct = COA_ACCOUNTS.find(a => a.code === row.accountCode);
            if (!acct) continue;
            const val = Math.abs(row.amount);
            if (acct.normalBalance === "Debit") dr += val; else cr += val;
        }

        return { totalDr: dr, totalCr: cr, diff: Math.abs(dr - cr) };
    }, [ob]);

    const isBalanced = diff < 1; // allow ₦1 rounding tolerance

    const acctOptions = COA_ACCOUNTS.filter(a =>
        !isHeaderAccount(a) &&
        !NAMED.some(n => n.account === a.code) // exclude already-named accounts
    );

    return (
        <OrgSettingsShell title="Opening Balances">
            <p className="text-[13px] text-muted-foreground mb-5 -mt-2">
                Single source of truth for all brought-forward values used by financial reports.
                Enter the trial balance as at the start of each fiscal year (migration date or year-opening).
            </p>

            <PageCard
                title={`Opening Balances — FY ${activeYear}`}
                action={
                    <div className="flex items-center gap-3">
                        {isClosed && (
                            <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground">
                                <Lock className="h-3.5 w-3.5" /> Closed (read-only)
                            </span>
                        )}
                        <Select value={String(activeYear)} onValueChange={v => setActiveYear(Number(v))}>
                            <SelectTrigger className="h-9 w-[140px] mono"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {fiscalYears.map(y => (
                                    <SelectItem key={y.year} value={String(y.year)}>FY {y.year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }
            >
                {/* ── Trial Balance Check ── */}
                <div className={cn(
                    "flex items-center justify-between rounded-md px-4 py-3 mb-6 text-[13px]",
                    isBalanced
                        ? "bg-success/10 border border-success/30"
                        : "bg-danger/10 border border-danger/30",
                )}>
                    <span className={cn("font-medium", isBalanced ? "text-success" : "text-danger")}>
                        {isBalanced ? "✓ Opening position balances" : "⚠ Opening position does not balance"}
                    </span>
                    <div className="flex items-center gap-6 mono text-[12px]">
                        <span>Dr <strong>{formatNGN(totalDr)}</strong></span>
                        <span>Cr <strong>{formatNGN(totalCr)}</strong></span>
                        {!isBalanced && (
                            <span className="text-danger font-semibold">
                                Difference: {formatNGN(diff)}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Named fields, grouped by section ── */}
                {(["Assets", "Liabilities", "Equity"] as const).map(section => (
                    <div key={section} className="mb-6">
                        <SectionHeading>{section}</SectionHeading>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            {NAMED.filter(f => f.section === section).map(field => (
                                <BalField
                                    key={field.key}
                                    label={field.label}
                                    account={field.account}
                                    normalBalance={field.normalBalance}
                                    hint={field.hint}
                                    value={ob[field.key] as number}
                                    disabled={isClosed}
                                    onChange={v => setOpeningBalance(activeYear, { [field.key]: v } as any)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {/* ── Custom / migration rows ── */}
                <SectionHeading>Additional Migration Balances</SectionHeading>
                <p className="text-[12px] text-muted-foreground mt-1 mb-3">
                    For any other accounts with opening balances not listed above (e.g. Inventory, Prepayments, PPE).
                    Amounts are entered in their normal balance direction (Debit or Credit as shown).
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Account</th>
                                <th className="text-center py-2 px-3 font-medium text-muted-foreground w-[60px]">Dr/Cr</th>
                                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Amount (₦)</th>
                                <th className="w-12 py-2 px-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {ob.customRows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-4 px-3 text-center text-[12.5px] text-muted-foreground">
                                        No additional migration balances.
                                    </td>
                                </tr>
                            )}
                            {ob.customRows.map(row => {
                                const acct = COA_ACCOUNTS.find(a => a.code === row.accountCode);
                                const nb = acct?.normalBalance ?? "Debit";
                                return (
                                    <tr key={row.id} className="border-b border-border/50">
                                        <td className="py-2 px-3 mono">
                                            {row.accountCode} · <span className="font-medium">{acct?.name ?? "Unknown"}</span>
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <span className={cn(
                                                "text-[11px] font-semibold px-1.5 py-0.5 rounded",
                                                nb === "Debit"
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-success/10 text-success",
                                            )}>
                                                {nb === "Debit" ? "Dr" : "Cr"}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 mono text-right">{formatNGN(row.amount)}</td>
                                        <td className="py-2 px-3">
                                            <button
                                                disabled={isClosed}
                                                onClick={() => removeCustomOpeningRow(activeYear, row.id)}
                                                className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 disabled:opacity-40"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Add row */}
                            {!isClosed && (
                                <tr className="border-b border-border bg-secondary/30">
                                    <td className="py-2 px-3">
                                        <Select value={newAcct} onValueChange={setNewAcct}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select account…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {acctOptions.map(a => (
                                                    <SelectItem key={a.code} value={a.code}>
                                                        <span className="mono">{a.code}</span> · {a.name}
                                                        <span className="ml-2 text-[10px] text-muted-foreground">
                                                            ({a.normalBalance === "Debit" ? "Dr" : "Cr"})
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        {newAcct && (() => {
                                            const a = COA_ACCOUNTS.find(x => x.code === newAcct);
                                            const nb = a?.normalBalance ?? "Debit";
                                            return (
                                                <span className={cn(
                                                    "text-[11px] font-semibold px-1.5 py-0.5 rounded",
                                                    nb === "Debit"
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-success/10 text-success",
                                                )}>
                                                    {nb === "Debit" ? "Dr" : "Cr"}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="py-2 px-3">
                                        <Input
                                            type="number"
                                            className="mono text-right h-9"
                                            value={newAmt}
                                            onChange={e => setNewAmt(Number(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <Button
                                            size="sm"
                                            className="h-9"
                                            onClick={() => {
                                                if (!newAcct) { toast.error("Select an account"); return; }
                                                addCustomOpeningRow(activeYear, { accountCode: newAcct, amount: newAmt });
                                                setNewAcct(""); setNewAmt(0);
                                                toast.success("Balance added");
                                            }}
                                        >
                                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="text-[11.5px] text-muted-foreground mt-5 leading-relaxed">
                    🔌 These values seed the trial balance opening columns and are consumed by all report
                    computations (P&amp;L, Balance Sheet, Cash Flow). Once a fiscal year is closed, its opening
                    balances become read-only.
                    {/* 🔌 BACKEND: GET/POST /api/settings/opening-balances?year= */}
                </p>
            </PageCard>
        </OrgSettingsShell>
    );
}

function BalField({
    label, account, normalBalance, hint, value, onChange, disabled,
}: {
    label: string;
    account: string;
    normalBalance: "Debit" | "Credit";
    hint?: string;
    value: number;
    onChange: (v: number) => void;
    disabled?: boolean;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <Label>{label}</Label>
                <div className="flex items-center gap-1.5">
                    <span className="mono text-[10.5px] text-muted-foreground">{account}</span>
                    <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                        normalBalance === "Debit"
                            ? "bg-primary/10 text-primary"
                            : "bg-success/10 text-success",
                    )}>
                        {normalBalance === "Debit" ? "Dr" : "Cr"}
                    </span>
                </div>
            </div>
            <Input
                type="number"
                value={value}
                disabled={disabled}
                onChange={e => onChange(Number(e.target.value) || 0)}
                className="mono"
                placeholder="0"
            />
            {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
        </div>
    );
}

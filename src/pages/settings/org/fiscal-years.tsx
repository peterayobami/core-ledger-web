import { OrgSettingsShell } from "@/components/settings/OrgSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { useOrgSettings } from "@/stores/org-settings.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Derives the start and end ISO dates for a fiscal year given the year label
 * and the company's fiscal year start month (1 = January).
 *
 * Examples:
 *   startMonth=1, year=2025 → 2025-01-01 to 2025-12-31
 *   startMonth=4, year=2025 → 2025-04-01 to 2026-03-31
 *   startMonth=7, year=2025 → 2025-07-01 to 2026-06-30
 */
function calcFyDates(year: number, startMonth: number): { startDate: string; endDate: string } {
    const pad = (n: number) => String(n).padStart(2, "0");
    const startDate = `${year}-${pad(startMonth)}-01`;

    let endYear: number;
    let endMonth: number;
    if (startMonth === 1) {
        endYear = year;
        endMonth = 12;
    } else {
        endYear = year + 1;
        endMonth = startMonth - 1;
    }
    // Last day of endMonth
    const lastDay = new Date(endYear, endMonth, 0).getDate();
    const endDate = `${endYear}-${pad(endMonth)}-${pad(lastDay)}`;
    return { startDate, endDate };
}

export default function FiscalYearsPage() {
    const fiscalYears = useOrgSettings(s => s.fiscalYears);
    const upsertFiscalYear = useOrgSettings(s => s.upsertFiscalYear);
    const closeFiscalYear = useOrgSettings(s => s.closeFiscalYear);
    const fiscalYearStartMonth = useOrgSettings(s => s.company.fiscalYearStartMonth);

    const [newYear, setNewYear] = useState<number>(new Date().getFullYear() + 1);

    function addYear() {
        if (fiscalYears.some(y => y.year === newYear)) {
            toast.error(`Fiscal year ${newYear} already exists.`);
            return;
        }
        const { startDate, endDate } = calcFyDates(newYear, fiscalYearStartMonth);
        upsertFiscalYear({ year: newYear, status: "active", startDate, endDate });
        toast.success(`FY ${newYear} added (${startDate} → ${endDate})`);
    }

    return (
        <OrgSettingsShell title="Fiscal Years">
            <PageCard
                title="Configured Fiscal Years"
                action={
                    <div className="flex items-end gap-2">
                        <div>
                            <Label className="text-[11px]">Year</Label>
                            <Input
                                type="number"
                                value={newYear}
                                onChange={e => setNewYear(Number(e.target.value) || 0)}
                                className="mono w-28 h-9"
                            />
                        </div>
                        <Button
                            onClick={addYear}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Add Year
                        </Button>
                    </div>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Fiscal Year</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Period</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                                <th className="text-right py-2 px-3 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fiscalYears.map(fy => (
                                <tr key={fy.year} className="border-b border-border/50 hover:bg-secondary/30">
                                    <td className="py-2 px-3 mono font-semibold">FY {fy.year}</td>
                                    <td className="py-2 px-3 mono text-muted-foreground text-[12px]">
                                        {fy.startDate} → {fy.endDate}
                                    </td>
                                    <td className="py-2 px-3">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
                                            fy.status === "active"
                                                ? "bg-success/15 text-success"
                                                : "bg-muted text-muted-foreground",
                                        )}>
                                            {fy.status === "closed" && <Lock className="h-3 w-3" />}
                                            {fy.status === "active" ? "Active" : "Closed"}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        {fy.status === "active" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    closeFiscalYear(fy.year);
                                                    toast.success(`FY ${fy.year} closed`);
                                                }}
                                            >
                                                <Lock className="h-3.5 w-3.5 mr-1" /> Close Year
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-[11.5px] text-muted-foreground mt-4">
                    Start and end dates are derived from the Fiscal Year Start Month set in{" "}
                    <a href="/settings/org/company" className="underline text-primary">Company Profile</a>.
                    Closing a year locks its opening balances and prevents back-dated journal posting.
                </p>
            </PageCard>
        </OrgSettingsShell>
    );
}

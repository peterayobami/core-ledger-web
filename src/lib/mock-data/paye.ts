import type { PayeBand, PayeProfile, Employee, Period, PayrollRun, Remittance, RunEntry } from "@/lib/models/paye";
import { computePaye } from "@/lib/services/paye.service";
import { HR_EMPLOYEES } from "@/lib/mock-data/employee";
import { fullName } from "@/lib/models/employee";

export const PAYE_BANDS: PayeBand[] = [
    { rate: 0, from: 0, to: 800_000, label: "0%", cumMax: 0 },
    { rate: 15, from: 800_000, to: 3_000_000, label: "15%", cumMax: 330_000 },
    { rate: 18, from: 3_000_000, to: 10_000_000, label: "18%", cumMax: 1_260_000 },
    { rate: 21, from: 10_000_000, to: 25_000_000, label: "21%", cumMax: 3_150_000 },
    { rate: 23, from: 25_000_000, to: 50_000_000, label: "23%", cumMax: 5_750_000 },
    { rate: 25, from: 50_000_000, to: null, label: "25%", cumMax: null },
];

export function bandColor(rate: number): string {
    switch (rate) {
        case 0: return "hsl(var(--chart-slate))";
        case 15: return "hsl(239 84% 80%)";
        case 18: return "hsl(239 84% 65%)";
        case 21: return "hsl(239 84% 50%)";
        case 23: return "hsl(262 83% 58%)";
        case 25: return "hsl(0 72% 51%)";
        default: return "hsl(var(--muted-foreground))";
    }
}

export function bandChipClasses(rate: number): string {
    switch (rate) {
        case 0: return "bg-secondary text-foreground/70 border-border";
        case 15: return "bg-accent-soft text-accent border-accent/30";
        case 18: return "bg-accent/20 text-accent border-accent/40";
        case 21: return "bg-accent text-accent-foreground border-accent";
        case 23: return "bg-[hsl(262_83%_58%)] text-white border-[hsl(262_83%_58%)]";
        case 25: return "bg-danger text-danger-foreground border-danger";
        default: return "bg-secondary text-muted-foreground border-border";
    }
}

export const blankPayeProfile = (): PayeProfile => ({
    basic: 0, housing: 0, transport: 0, other: 0,
    rentPaid: 0, rentReliefApproved: false, lifeInsurance: 0,
    nhisOptIn: false, nhisAmount: 0,
    residency: "Resident", state: "Lagos", tin: null, hasProfile: false,
});

/** Derives the canonical PAYE employee list from the HR employee registry. */
export const EMPLOYEES: Employee[] = HR_EMPLOYEES.map(e => ({
    id: e.id,
    name: fullName(e),
    department: e.department,
    email: e.email,
    profile: e.payeProfile ?? blankPayeProfile(),
}));

// Period helpers
export const CURRENT_PERIOD: Period = { year: 2026, month: 3 };
export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const periodKey = (p: Period) => `${p.year}-${String(p.month).padStart(2, "0")}`;
export const periodLong = (p: Period) => `${MONTH_LONG[p.month - 1]} ${p.year}`;
export const periodShort = (p: Period) => `${MONTH_NAMES[p.month - 1]} ${p.year}`;

export function prevPeriod(p: Period): Period {
    if (p.month === 1) return { year: p.year - 1, month: 12 };
    return { year: p.year, month: p.month - 1 };
}
export function addMonths(p: Period, n: number): Period {
    const idx = p.year * 12 + (p.month - 1) + n;
    return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

function buildRunEntries(period: Period, factor: number): RunEntry[] {
    return EMPLOYEES.filter(e => e.profile.hasProfile).map((e, i) => {
        const adj: PayeProfile = {
            ...e.profile,
            basic: Math.round(e.profile.basic * factor),
            housing: Math.round(e.profile.housing * factor),
            transport: Math.round(e.profile.transport * factor),
            other: Math.round(e.profile.other * factor * (1 + ((i % 3) * 0.02))),
        };
        const c = computePaye(adj);
        return {
            employeeId: e.id,
            monthlyGross: c.monthlyGross,
            monthlyPension: c.monthlyPension,
            monthlyNhf: c.monthlyNhf,
            monthlyRentRelief: c.monthlyRentRelief,
            monthlyChargeable: Math.round(c.chargeableAnnual / 12),
            highestBand: c.highestBand,
            monthlyPaye: c.monthlyPaye,
            monthlyNet: c.monthlyNet,
            isExempt: c.isExempt,
        };
    });
}

function buildRun(period: Period, status: import("@/lib/models/paye").PayeRunStatus, factor: number): PayrollRun {
    const entries = buildRunEntries(period, factor);
    const gross = entries.reduce((s, e) => s + e.monthlyGross, 0);
    const pension = entries.reduce((s, e) => s + e.monthlyPension, 0);
    const nhf = entries.reduce((s, e) => s + e.monthlyNhf, 0);
    const paye = entries.reduce((s, e) => s + e.monthlyPaye, 0);
    const net = entries.reduce((s, e) => s + e.monthlyNet, 0);
    const exemptCount = entries.filter(e => e.isExempt).length;
    const avgEtr = gross > 0 ? (paye / gross) * 100 : 0;
    return {
        period, status, entries,
        computedAt: status !== "no_run" ? `${period.year}-${String(period.month).padStart(2, "0")}-26` : undefined,
        approvedAt: status === "approved" || status === "locked" ? `${period.year}-${String(period.month).padStart(2, "0")}-27` : undefined,
        lockedAt: status === "locked" ? `${period.year}-${String(period.month).padStart(2, "0")}-28` : undefined,
        lockedBy: status === "locked" ? "Olamide Ade" : undefined,
        totals: { gross, pension, nhf, paye, net, headcount: entries.length, avgEtr, exemptCount },
    };
}

function dueDateForPeriod(p: Period): string {
    const next = addMonths(p, 1);
    return `${next.year}-${String(next.month).padStart(2, "0")}-10`;
}

function buildRunHistory(): PayrollRun[] {
    const runs: PayrollRun[] = [];
    for (let i = 11; i >= 0; i--) {
        const p = addMonths(CURRENT_PERIOD, -i);
        const factor = 0.92 + (11 - i) * 0.008;
        const status: import("@/lib/models/paye").PayeRunStatus = i === 0 ? "computed" : "locked";
        const run = buildRun(p, status, factor);
        if (status === "locked") {
            run.remittance = {
                period: p,
                amount: run.totals.paye,
                dueDate: dueDateForPeriod(p),
                submittedDate: `${addMonths(p, 1).year}-${String(addMonths(p, 1).month).padStart(2, "0")}-08`,
                paymentRef: `FIRS-${p.year}${String(p.month).padStart(2, "0")}-PAYE`,
                penalty: 0,
                status: "submitted",
            };
        }
        if (runs.length > 0) {
            const prior = runs[runs.length - 1];
            run.entries.forEach(e => {
                const pe = prior.entries.find(x => x.employeeId === e.employeeId);
                if (pe) e.priorMonthlyPaye = pe.monthlyPaye;
            });
        }
        runs.push(run);
    }
    return runs;
}

export const RUNS: PayrollRun[] = buildRunHistory();

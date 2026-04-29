import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface DetailHeaderProps {
    backTo: string;
    backLabel: string;
    eyebrow: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    accent?: "primary" | "yellow" | "success" | "orange" | "danger" | "skyblue";
    onEdit?: () => void;
    onDelete?: () => void;
}

const accentMap: Record<NonNullable<DetailHeaderProps["accent"]>, { bg: string; fg: string }> = {
    primary: { bg: "rgba(24,79,151,0.10)", fg: "#184F97" },
    yellow: { bg: "rgba(255,193,7,0.18)", fg: "#B8860B" },
    success: { bg: "rgba(0,160,103,0.10)", fg: "#00A067" },
    orange: { bg: "rgba(244,119,39,0.12)", fg: "#F47727" },
    danger: { bg: "rgba(252,90,90,0.10)", fg: "#FC5A5A" },
    skyblue: { bg: "rgba(35,126,181,0.12)", fg: "#237EB5" },
};

export function DetailHeader({
    backTo, backLabel, eyebrow, title, subtitle, icon, accent = "primary", onEdit, onDelete,
}: DetailHeaderProps) {
    const router = useRouter();
    const a = accentMap[accent];
    return (
        <div className="mb-5">
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--cl-text-muted)] hover:text-[var(--cl-text)] mb-3"
            >
                <ArrowLeft size={14} /> Back
            </button>
            <div className="flex items-start gap-4">
                <span
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{ backgroundColor: a.bg, color: a.fg }}
                >
                    {icon}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--cl-text-faded)]">
                            {eyebrow}
                        </span>
                        <Link
                            href={backTo}
                            className="text-[10px] uppercase tracking-[0.14em] text-[var(--cl-text-faded)] hover:text-[var(--cl-primary)]"
                        >
                            · {backLabel}
                        </Link>
                    </div>
                    <h1 className="text-xl font-semibold text-[var(--cl-text)] mt-1 truncate">{title}</h1>
                    {subtitle && <p className="text-sm text-[var(--cl-text-muted)] mt-0.5">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {onEdit && (
                        <Button variant="ghost" icon={<Pencil size={15} />} onClick={onEdit}>Edit</Button>
                    )}
                    {onDelete && (
                        <Button variant="dangerGhost" icon={<Trash2 size={15} />} onClick={onDelete}>Delete</Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export function DetailGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">{children}</div>;
}

export function DetailMain({ children }: { children: React.ReactNode }) {
    return <div className="lg:col-span-2 space-y-5">{children}</div>;
}

export function DetailSide({ children }: { children: React.ReactNode }) {
    return <div className="space-y-5">{children}</div>;
}

export function Section({ title, children, action, className }: { title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
    return (
        <section
            className={cn("bg-white rounded-xl border border-[var(--cl-border)] p-5", className)}
            style={{ boxShadow: "0 2px 4px rgba(102,102,102,0.035), 0 0 8px rgba(102,102,102,0.059)" }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--cl-text-muted)]">
                    {title}
                </h3>
                {action}
            </div>
            {children}
        </section>
    );
}

export function FieldRow({ label, children, mono, span = 1 }: { label: string; children: React.ReactNode; mono?: boolean; span?: 1 | 2 }) {
    return (
        <div className={cn("min-w-0", span === 2 && "sm:col-span-2")}>
            <div className="text-[10px] uppercase tracking-wider font-medium text-[var(--cl-text-faded)] mb-1">
                {label}
            </div>
            <div className={cn("text-sm text-[var(--cl-text)] break-words", mono && "mono")}>
                {children || <span className="text-[var(--cl-text-faded)]">—</span>}
            </div>
        </div>
    );
}

export function FieldsGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
    const map = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;
    return <div className={cn("grid gap-x-6 gap-y-4", map[cols])}>{children}</div>;
}

export function MoneyLine({ label, value, emphasis, tone }: { label: string; value: number; emphasis?: boolean; tone?: "muted" | "danger" | "success" | "primary" }) {
    const colorMap: Record<NonNullable<typeof tone>, string> = {
        muted: "var(--cl-text-muted)",
        danger: "var(--cl-danger)",
        success: "var(--cl-success-variant)",
        primary: "var(--cl-primary)",
    };
    return (
        <div className="flex items-center justify-between gap-4 py-2">
            <span className={cn("text-sm", emphasis ? "font-semibold text-[var(--cl-text)]" : "text-[var(--cl-text-muted)]")}>
                {label}
            </span>
            <span
                className={cn("mono", emphasis ? "text-base font-semibold" : "text-sm")}
                style={{ color: tone ? colorMap[tone] : undefined }}
            >
                ₦{formatNGN(value)}
            </span>
        </div>
    );
}

function formatNGN(v: number) {
    return v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

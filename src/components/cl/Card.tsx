import * as React from "react";
import { cn } from "@/lib/utils";

export function SidePanelCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <section
            className={cn("bg-white rounded-xl border border-[var(--cl-border)] p-5", className)}
            style={{ boxShadow: "0 2px 4px rgba(102,102,102,0.035), 0 0 8px rgba(102,102,102,0.059)" }}
        >
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--cl-text-muted)] mb-4">{title}</h3>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

export function DetailRow({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-xs text-[var(--cl-text-muted)] shrink-0 pt-0.5">{label}</span>
            <div className={cn("text-sm text-[var(--cl-text)] text-right max-w-[60%] break-words", mono && "mono")}>{children}</div>
        </div>
    );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-5">
            <h1 className="text-xl font-semibold text-[var(--cl-text)]">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--cl-text-muted)] mt-1">{subtitle}</p>}
        </div>
    );
}

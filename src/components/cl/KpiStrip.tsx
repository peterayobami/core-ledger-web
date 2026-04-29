import * as React from "react";
import { cn } from "@/lib/utils";

export interface Kpi {
    label: string;
    value: string;
    hint?: string;
    accent?: string;
    icon?: React.ReactNode;
}

export function KpiStrip({ items, className }: { items: Kpi[]; className?: string }) {
    return (
        <div
            className={cn(
                "grid gap-4 mb-5",
                items.length === 4 ? "grid-cols-2 xl:grid-cols-4" : items.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2",
                className
            )}
        >
            {items.map((k) => {
                const accent = k.accent ?? "var(--cl-primary)";
                return (
                    <div
                        key={k.label}
                        className="bg-white rounded-xl border border-[var(--cl-border)] p-4"
                        style={{ boxShadow: "0 2px 4px rgba(102,102,102,0.035), 0 0 8px rgba(102,102,102,0.059)" }}
                    >
                        <div className="flex items-center gap-3">
                            {k.icon && (
                                <span
                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
                                        color: accent,
                                    }}
                                >
                                    {k.icon}
                                </span>
                            )}
                            <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--cl-text-muted)] truncate">
                                    {k.label}
                                </p>
                                <p className="mono text-lg font-semibold text-[var(--cl-text)] mt-0.5 truncate">{k.value}</p>
                                {k.hint && <p className="text-[11px] text-[var(--cl-text-faded)] mt-0.5 truncate">{k.hint}</p>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

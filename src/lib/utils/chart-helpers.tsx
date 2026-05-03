import { formatNGN } from "@/lib/utils/format";

export function abbr(v: number): string {
    const a = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    if (a >= 1e9) return `${sign}₦${(a / 1e9).toFixed(1)}B`;
    if (a >= 1e6) return `${sign}₦${(a / 1e6).toFixed(1)}M`;
    if (a >= 1e3) return `${sign}₦${(a / 1e3).toFixed(0)}K`;
    return `${sign}₦${a.toFixed(0)}`;
}

export function MoneyTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-border bg-card shadow-md px-3 py-2 text-[12px]">
            <div className="font-semibold mb-1 text-foreground">{label}</div>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
                        <span className="text-muted-foreground">{p.name}</span>
                    </span>
                    <span className="mono font-medium">{formatNGN(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

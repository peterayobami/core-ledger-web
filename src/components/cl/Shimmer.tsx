import { cn } from "@/lib/utils";

interface ShimmerBoxProps {
    width?: number | string;
    height?: number | string;
    radius?: number | string;
    className?: string;
}

export function ShimmerBox({ width = "100%", height = 16, radius = 8, className }: ShimmerBoxProps) {
    return (
        <div
            className={cn("cl-shimmer", className)}
            style={{ width, height, borderRadius: typeof radius === "number" ? `${radius}px` : radius }}
        />
    );
}

export function TableShimmer({ columns = 6, rows = 8 }: { columns?: number; rows?: number }) {
    return (
        <div className="w-full">
            <div className="flex items-center gap-4 px-5 py-3 border-b border-[var(--cl-divider)]/50">
                {Array.from({ length: columns }).map((_, i) => (
                    <ShimmerBox key={i} width={i === 1 ? "30%" : "12%"} height={12} />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex items-center gap-4 px-5 h-[52px] border-b border-[var(--cl-divider)]/40">
                    {Array.from({ length: columns }).map((_, c) => (
                        <ShimmerBox
                            key={c}
                            width={c === 1 ? `${50 + ((r * 7) % 30)}%` : `${10 + ((r * 3 + c) % 6)}%`}
                            height={14}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function DetailCardShimmer({ rows = 6 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-xl border border-[var(--cl-border)] p-5 space-y-4" style={{ boxShadow: "0 2px 4px rgba(102,102,102,0.035), 0 0 8px rgba(102,102,102,0.059)" }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <ShimmerBox width={70} height={12} />
                    <ShimmerBox width={`${100 + ((i * 23) % 100)}px`} height={14} />
                </div>
            ))}
        </div>
    );
}

export function RightPanelShimmer() {
    return (
        <div className="space-y-4">
            <DetailCardShimmer rows={6} />
            <DetailCardShimmer rows={3} />
            <DetailCardShimmer rows={3} />
        </div>
    );
}

export function ProgressBar({ active }: { active: boolean }) {
    if (!active) return <div className="h-[2px]" />;
    return (
        <div className="relative h-[2px] overflow-hidden bg-[var(--cl-alpha)]">
            <div className="cl-progress-bar absolute inset-0" />
        </div>
    );
}

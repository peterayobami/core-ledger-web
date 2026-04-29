import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipOption<T extends string | number> {
    value: T;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    accent?: "default" | "success" | "danger";
}

interface ChipSelectorProps<T extends string | number> {
    options: ChipOption<T>[];
    value: T | null;
    onChange: (v: T) => void;
    layout?: "grid-2" | "wrap" | "inline-2";
    size?: "default" | "compact";
    disabled?: boolean;
    error?: string;
}

export function ChipSelector<T extends string | number>({
    options, value, onChange, layout = "wrap", size = "default", disabled, error,
}: ChipSelectorProps<T>) {
    const containerClass =
        layout === "grid-2" ? "grid grid-cols-2 gap-2"
            : layout === "inline-2" ? "grid grid-cols-2 gap-2"
                : "flex flex-wrap gap-2";
    const heightClass = size === "compact" ? "min-h-[40px]" : "min-h-[44px]";

    return (
        <div>
            <div className={containerClass}>
                {options.map((opt) => {
                    const selected = opt.value === value;
                    const accent = opt.accent ?? "default";
                    return (
                        <button
                            key={String(opt.value)}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(opt.value)}
                            className={cn(
                                heightClass,
                                "flex items-center gap-2 px-3 rounded-lg text-sm transition-all duration-200 text-left",
                                "border-[0.8px]",
                                disabled && "bg-[var(--cl-bg)] border-[var(--cl-alpha)] text-[#BEBEBE] cursor-not-allowed",
                                !disabled && selected && accent === "default" && "bg-[rgba(24,79,151,0.07)] border-[var(--cl-primary)] text-[var(--cl-primary)] border-[1.2px]",
                                !disabled && selected && accent === "success" && "bg-[rgba(0,160,103,0.08)] border-[var(--cl-success-variant)] text-[var(--cl-success-variant)] border-[1.2px]",
                                !disabled && selected && accent === "danger" && "bg-[rgba(252,90,90,0.08)] border-[var(--cl-danger)] text-[var(--cl-danger)] border-[1.2px]",
                                !disabled && !selected && "bg-white border-[#D9D9D9] text-[var(--cl-text-muted)] hover:bg-[#F9FAFB] hover:border-[rgba(24,79,151,0.4)] hover:text-[var(--cl-text)]"
                            )}
                        >
                            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                            <span className="flex-1 truncate font-medium">{opt.label}</span>
                            {opt.description && (
                                <span className="text-[10px] opacity-70 mono shrink-0">{opt.description}</span>
                            )}
                        </button>
                    );
                })}
            </div>
            {error && <p className="mt-1.5 text-xs text-[var(--cl-danger)]">{error}</p>}
        </div>
    );
}

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "ghost" | "dangerGhost" | "dangerFilled";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export function Button({
    variant = "primary", loading, icon, fullWidth, className, children, disabled, ...props
}: ButtonProps) {
    const base = "inline-flex items-center justify-center gap-2 h-[40px] px-4 text-sm font-medium rounded-lg transition-all duration-150 disabled:cursor-not-allowed select-none";
    const variants: Record<ButtonVariant, string> = {
        primary: "bg-[var(--cl-primary)] text-white hover:bg-[var(--cl-primary-deep)] disabled:opacity-70",
        ghost: "bg-[var(--cl-bg)] text-[var(--cl-text-muted)] border border-[var(--cl-divider)] hover:bg-[var(--cl-alpha)]",
        dangerGhost: "bg-[var(--cl-bg)] text-[var(--cl-danger)] border border-[var(--cl-alpha)] hover:bg-[rgba(252,90,90,0.06)]",
        dangerFilled: "bg-[var(--cl-danger)] text-white hover:opacity-90 disabled:opacity-70",
    };
    return (
        <button
            className={cn(base, variants[variant], fullWidth && "w-full", className)}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
            {children}
        </button>
    );
}

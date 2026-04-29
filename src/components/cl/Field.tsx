import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-xs font-semibold text-[var(--cl-text)] mb-1.5 tracking-wide">
            {children}
            {required && <span className="text-[var(--cl-danger)] ml-0.5">*</span>}
        </label>
    );
}

export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1.5 text-xs text-[var(--cl-danger)]">{message}</p>;
}

interface FieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    hint?: string;
}

export function Field({ label, required, error, children, hint }: FieldProps) {
    return (
        <div>
            <Label required={required}>{label}</Label>
            {children}
            {hint && !error && <p className="mt-1 text-[11px] text-[var(--cl-text-faded)]">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean; mono?: boolean };
export const TextInput = React.forwardRef<HTMLInputElement, InputProps>(function TextInput(
    { className, error, mono, ...props }, ref
) {
    return (
        <input
            ref={ref}
            className={cn(
                "w-full h-[44px] px-3.5 text-sm bg-[var(--cl-input)] rounded-[10px] border-0 outline-none transition-colors",
                "placeholder:text-[#BEBEBE]",
                "focus:ring-[1.2px] focus:ring-[var(--cl-primary)] focus:bg-white",
                error && "ring-1 ring-[var(--cl-danger)]",
                mono && "mono",
                className
            )}
            {...props}
        />
    );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean };
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function TextArea(
    { className, error, ...props }, ref
) {
    return (
        <textarea
            ref={ref}
            className={cn(
                "w-full px-3.5 py-3 text-sm bg-[var(--cl-input)] rounded-[10px] border-0 outline-none transition-colors resize-y",
                "placeholder:text-[#BEBEBE]",
                "focus:ring-[1.2px] focus:ring-[var(--cl-primary)] focus:bg-white",
                error && "ring-1 ring-[var(--cl-danger)]",
                className
            )}
            {...props}
        />
    );
});

interface CurrencyInputProps {
    value: number;
    onChange: (n: number) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    readOnly?: boolean;
}

export function CurrencyInput({ value, onChange, placeholder, disabled, error, readOnly }: CurrencyInputProps) {
    const [text, setText] = React.useState(value ? value.toLocaleString("en-NG") : "");
    React.useEffect(() => {
        setText(value ? value.toLocaleString("en-NG", { maximumFractionDigits: 2 }) : "");
    }, [value]);

    return (
        <div
            className={cn(
                "flex items-stretch h-[44px] bg-[var(--cl-input)] rounded-[10px] overflow-hidden transition-all",
                "focus-within:ring-[1.2px] focus-within:ring-[var(--cl-primary)] focus-within:bg-white",
                error && "ring-1 ring-[var(--cl-danger)]",
                disabled && "opacity-60",
                readOnly && "bg-[var(--cl-alpha)]"
            )}
        >
            <span className="flex items-center px-3.5 text-[var(--cl-text-muted)] text-sm border-r border-[var(--cl-divider)]/40">₦</span>
            <input
                type="text"
                inputMode="decimal"
                value={text}
                readOnly={readOnly}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d.]/g, "");
                    setText(raw);
                    const n = Number(raw);
                    onChange(Number.isFinite(n) ? n : 0);
                }}
                onBlur={() => {
                    const n = Number(text.replace(/,/g, ""));
                    if (Number.isFinite(n) && n > 0) setText(n.toLocaleString("en-NG", { maximumFractionDigits: 2 }));
                }}
                className="flex-1 bg-transparent outline-none px-3 mono text-sm placeholder:text-[#BEBEBE]"
            />
        </div>
    );
}

export function DateField({ value, onChange, max, error, disabled }: {
    value: string; onChange: (v: string) => void; max?: string; error?: boolean; disabled?: boolean;
}) {
    return (
        <input
            type="date"
            value={value ? value.slice(0, 10) : ""}
            max={max}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full h-[44px] px-3.5 text-sm bg-[var(--cl-input)] rounded-[10px] border-0 outline-none mono transition-colors",
                "focus:ring-[1.2px] focus:ring-[var(--cl-primary)] focus:bg-white",
                error && "ring-1 ring-[var(--cl-danger)]"
            )}
        />
    );
}

export function ServerErrorBanner({ message }: { message?: string | null }) {
    if (!message) return null;
    return (
        <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg text-xs"
            style={{
                backgroundColor: "rgba(252,90,90,0.06)",
                border: "1px solid rgba(252,90,90,0.30)",
                color: "#C13B3B",
            }}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="leading-relaxed">{message}</span>
        </div>
    );
}

export function CollapseField({ open, children }: { open: boolean; children: React.ReactNode }) {
    return (
        <div
            style={{
                maxHeight: open ? 400 : 0,
                opacity: open ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 300ms ease, opacity 250ms ease, margin 250ms ease",
                marginTop: open ? 16 : 0,
            }}
        >
            {children}
        </div>
    );
}

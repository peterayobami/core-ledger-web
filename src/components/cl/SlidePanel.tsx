import * as React from "react";
import { X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlidePanelProps {
    open: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    width?: number;
    level?: number;
    onBack?: () => void;
    headerAccent?: "yellow" | "primary";
}

export function SlidePanel({
    open, onClose, title, icon, children, footer, width = 480, level = 0, onBack, headerAccent = "yellow",
}: SlidePanelProps) {
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") (onBack ?? onClose)(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose, onBack]);

    if (!open) return null;

    const accentBg = headerAccent === "yellow" ? "rgba(255,193,7,0.18)" : "rgba(24,79,151,0.10)";
    const accentColor = headerAccent === "yellow" ? "#B8860B" : "#184F97";

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {level === 0 && (
                <div
                    className="absolute inset-0 cl-backdrop-enter"
                    style={{ backgroundColor: "rgba(0,0,0,0.30)" }}
                    onClick={onClose}
                />
            )}
            <aside
                className={cn("relative h-full bg-white flex flex-col cl-panel-enter shadow-[-8px_0_24px_rgba(16,16,16,0.12)] max-w-full")}
                style={{ width }}
            >
                <header className="flex items-center gap-3 px-5 h-[64px] border-b border-[var(--cl-border)] shrink-0">
                    {onBack ? (
                        <button onClick={onBack} className="p-1.5 rounded-md hover:bg-[var(--cl-alpha)] text-[var(--cl-text-muted)]">
                            <ArrowLeft size={18} />
                        </button>
                    ) : icon ? (
                        <span
                            className="flex items-center justify-center w-9 h-9 rounded-lg"
                            style={{ backgroundColor: accentBg, color: accentColor }}
                        >
                            {icon}
                        </span>
                    ) : null}
                    <h2 className="flex-1 text-base font-semibold text-[var(--cl-text)] truncate">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--cl-alpha)] text-[var(--cl-text-muted)]" aria-label="Close">
                        <X size={18} />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto px-5 py-5 cl-no-scrollbar">{children}</div>
                {footer && (
                    <footer className="px-5 py-4 border-t border-[var(--cl-border)] flex items-center justify-end gap-2 shrink-0">
                        {footer}
                    </footer>
                )}
            </aside>
        </div>
    );
}

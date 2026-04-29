import * as React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    body: string;
    tone?: "neutral" | "danger";
    action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, body, tone = "neutral", action }: EmptyStateProps) {
    const bg = tone === "danger" ? "rgba(252,90,90,0.08)" : "var(--cl-alpha)";
    const color = tone === "danger" ? "var(--cl-danger)" : "var(--cl-text-faded)";
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div
                className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: bg, color }}
            >
                {icon}
            </div>
            <h3 className="text-base font-semibold text-[var(--cl-text)]">{title}</h3>
            <p className="text-sm text-[var(--cl-text-muted)] mt-1.5 max-w-sm">{body}</p>
            {action && (
                <div className="mt-5">
                    <Button onClick={action.onClick}>{action.label}</Button>
                </div>
            )}
        </div>
    );
}

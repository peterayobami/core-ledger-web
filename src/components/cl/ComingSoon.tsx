import { Construction } from "lucide-react";
import { PageHeader } from "./Card";

export function ComingSoon({ title, body = "This module is on the roadmap and will be available soon." }: { title: string; body?: string }) {
    return (
        <div>
            <PageHeader title={title} />
            <div
                className="bg-white rounded-xl border border-[var(--cl-border)] py-20 flex flex-col items-center text-center px-6"
                style={{ boxShadow: "0 2px 4px rgba(102,102,102,0.035), 0 0 8px rgba(102,102,102,0.059)" }}
            >
                <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: "var(--cl-alpha)", color: "var(--cl-text-faded)" }}>
                    <Construction size={36} strokeWidth={1.6} />
                </div>
                <h3 className="text-base font-semibold text-[var(--cl-text)]">{title} — coming soon</h3>
                <p className="text-sm text-[var(--cl-text-muted)] mt-1.5 max-w-md">{body}</p>
            </div>
        </div>
    );
}

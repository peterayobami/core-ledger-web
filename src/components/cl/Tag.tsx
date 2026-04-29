import { cn } from "@/lib/utils";
import type { CustomerType } from "@/data/types";

type TagTone = "primary" | "skyblue" | "success" | "orange" | "danger" | "muted";

const toneStyles: Record<TagTone, { color: string; bg: string }> = {
    primary: { color: "#184F97", bg: "rgba(24,79,151,0.10)" },
    skyblue: { color: "#237EB5", bg: "rgba(35,126,181,0.10)" },
    success: { color: "#00A067", bg: "rgba(0,160,103,0.10)" },
    orange: { color: "#F47727", bg: "rgba(244,119,39,0.10)" },
    danger: { color: "#FC5A5A", bg: "rgba(252,90,90,0.10)" },
    muted: { color: "#9D9D9D", bg: "rgba(0,0,0,0.05)" },
};

export function Tag({ children, tone = "primary", className }: { children: React.ReactNode; tone?: TagTone; className?: string }) {
    const s = toneStyles[tone];
    return (
        <span
            className={cn("inline-flex items-center text-[11px] font-medium leading-none", className)}
            style={{ color: s.color, backgroundColor: s.bg, borderRadius: 50, padding: "4px 8px" }}
        >
            {children}
        </span>
    );
}

export function YesNoTag({ value, yesTone = "success" }: { value: boolean; yesTone?: TagTone }) {
    return value ? <Tag tone={yesTone}>Yes</Tag> : <Tag tone="muted">No</Tag>;
}

export function CustomerTypeTag({ type }: { type: CustomerType }) {
    const map: Record<CustomerType, { label: string; tone: TagTone }> = {
        Individual: { label: "Individual", tone: "primary" },
        Organization: { label: "Organization", tone: "skyblue" },
        NonProfit: { label: "Non-Profit", tone: "success" },
        Government: { label: "Government", tone: "orange" },
    };
    const m = map[type];
    return <Tag tone={m.tone}>{m.label}</Tag>;
}

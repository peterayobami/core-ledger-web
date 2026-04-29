export function formatNaira(value: number | null | undefined, opts?: { decimals?: number }): string {
    if (value === null || value === undefined || Number.isNaN(value)) return "0.00";
    const decimals = opts?.decimals ?? 2;
    return value.toLocaleString("en-NG", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatNumber(value: number, decimals = 0): string {
    return value.toLocaleString("en-NG", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function parseNumberInput(raw: string): number {
    const cleaned = raw.replace(/,/g, "").trim();
    if (!cleaned) return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
}

export function formatDate(d: Date | string | null | undefined): string {
    if (!d) return "—";
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function avatarPalette(name: string): { bg: string; fg: string } {
    const palette = [
        { bg: "#EBF2FF", fg: "#184F97" },
        { bg: "#E8F8EE", fg: "#00A067" },
        { bg: "#FFF3E0", fg: "#F47727" },
        { bg: "#F3E5F5", fg: "#7B1FA2" },
        { bg: "#E3F2FD", fg: "#237EB5" },
    ];
    const sum = (name || "?").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return palette[sum % 5];
}

export function initials(name: string): string {
    const parts = (name || "?").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

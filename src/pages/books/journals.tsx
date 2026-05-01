import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { ReportKpi, ReportKpiStrip, PageCard, Tag } from "@/components/reports/ReportPrimitives";
import { YearSelect, PeriodSelect, periodLabel } from "@/components/reports/PeriodFilter";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, BookOpen, FileText, ShieldCheck, Scale, Printer, ChevronLeft } from "lucide-react";
import { generateJournals } from "@/lib/services/ledger.service";
import { defaultYear, type Period } from "@/lib/services/tax.service";
import type { JournalEntry, JournalSource } from "@/lib/models/ledger";
import { formatNGN, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SOURCE_FILTERS: Array<{ value: "all" | JournalSource; label: string }> = [
    { value: "all", label: "All Sources" },
    { value: "Revenue", label: "Revenue" },
    { value: "Purchase", label: "Purchase" },
    { value: "Expense", label: "Expense" },
    { value: "Asset", label: "Asset" },
    { value: "Depreciation", label: "Depreciation" },
    { value: "Manual", label: "Manual" },
];

const SOURCE_TONE: Record<JournalSource, "primary" | "success" | "warning" | "skyblue" | "purple" | "muted"> = {
    Revenue: "success",
    Purchase: "warning",
    Expense: "warning",
    Asset: "skyblue",
    Depreciation: "purple",
    Payroll: "primary",
    Manual: "muted",
};

export default function JournalsPage() {
    const [year, setYear] = useState<number>(defaultYear());
    const [period, setPeriod] = useState<Period>("full");
    const [source, setSource] = useState<"all" | JournalSource>("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const journals = useMemo(() => generateJournals(year, period), [year, period]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return journals.filter(j => {
            if (source !== "all" && j.source !== source) return false;
            if (!q) return true;
            return (
                j.reference.toLowerCase().includes(q) ||
                j.narration.toLowerCase().includes(q) ||
                j.lines.some(l => l.accountCode.includes(q) || l.accountName.toLowerCase().includes(q))
            );
        });
    }, [journals, source, search]);

    const totalDr = filtered.reduce((s, j) => s + j.totalDebit, 0);
    const totalCr = filtered.reduce((s, j) => s + j.totalCredit, 0);
    const balanced = Math.abs(totalDr - totalCr) < 1;

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    // Reset to first page when filters change
    useEffect(() => { setPage(1); }, [year, period, source, search, pageSize]);

    return (
        <>
            <TopBar title="Journals" />
            <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
                {/* Header */}
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Books</div>
                        <h1 className="text-xl font-semibold mt-1">Journals</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Auto-generated ledger entries — {periodLabel(year, period)}.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <YearSelect value={year} onChange={setYear} />
                        <PeriodSelect value={period} onChange={setPeriod} />
                        <Button variant="outline" onClick={() => toast.info("Export coming soon")}>
                            <Printer className="h-4 w-4 mr-1.5" /> Export
                        </Button>
                    </div>
                </header>

                {/* KPIs */}
                <ReportKpiStrip>
                    <ReportKpi label="Journal Entries" value={filtered.length.toString()}
                        hint="Posted in period" icon={BookOpen} tone="primary" />
                    <ReportKpi label="Total Debit" value={formatNGN(totalDr)}
                        hint="Sum of all Dr lines" icon={FileText} tone="skyblue" />
                    <ReportKpi label="Total Credit" value={formatNGN(totalCr)}
                        hint="Sum of all Cr lines" icon={FileText} tone="warning" />
                    <ReportKpi label="Balance Check" value={balanced ? "Balanced" : "Imbalanced"}
                        hint={balanced ? "Dr = Cr ✓" : `Δ ${formatNGN(totalDr - totalCr)}`}
                        icon={balanced ? ShieldCheck : Scale}
                        tone={balanced ? "success" : "danger"} />
                </ReportKpiStrip>

                {/* Filters */}
                <PageCard>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <SearchInput value={search} onChange={setSearch} placeholder="Search reference, narration, account…" />
                        <Select value={source} onValueChange={(v) => setSource(v as "all" | JournalSource)}>
                            <SelectTrigger className="h-9 w-[180px] text-sm bg-card">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SOURCE_FILTERS.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="ml-auto text-[12px] text-muted-foreground">
                            Showing{" "}
                            <span className="mono font-semibold text-foreground">
                                {filtered.length === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)}
                            </span>{" "}
                            of <span className="mono">{filtered.length}</span> entries
                        </span>
                    </div>

                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-12">
                            No journal entries match the current filters.
                        </p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {paginated.map(j => (
                                    <JournalRow key={j.id} entry={j} />
                                ))}
                            </div>

                            {/* Pagination footer */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                                    <span>Rows per page</span>
                                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                                        <SelectTrigger className="h-8 w-[72px] text-xs bg-card">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[10, 25, 50, 100].map(n => (
                                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={currentPage <= 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                    </Button>
                                    <span className="px-3 text-[12px] text-muted-foreground mono">
                                        Page <span className="text-foreground font-semibold">{currentPage}</span> of{" "}
                                        <span className="text-foreground font-semibold">{totalPages}</span>
                                    </span>
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    >
                                        Next <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </PageCard>
            </div>
        </>
    );
}

function JournalRow({ entry }: Readonly<{ entry: JournalEntry }>) {
    const [open, setOpen] = useState(false);
    const tone = SOURCE_TONE[entry.source];

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
                <button className="w-full grid grid-cols-12 items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary/40 transition-colors text-left">
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform col-span-1", open && "rotate-90")} />
                    <span className="mono text-[12px] text-muted-foreground col-span-2">{entry.reference}</span>
                    <span className="mono text-[12px] text-foreground col-span-1">{formatDate(entry.date)}</span>
                    <span className="text-[13px] truncate col-span-5">{entry.narration}</span>
                    <span className="col-span-1"><Tag tone={tone}>{entry.source}</Tag></span>
                    <span className="mono text-[12px] text-right col-span-2 font-semibold">
                        {formatNGN(entry.totalDebit)}
                    </span>
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="overflow-x-auto mt-1 mx-3 mb-3">
                    <table className="w-full text-[12.5px]">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground w-[80px]">Code</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Account</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Description</th>
                                <th className="text-right py-2 px-3 font-medium text-muted-foreground fig">Debit</th>
                                <th className="text-right py-2 px-3 font-medium text-muted-foreground fig">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entry.lines.map(l => (
                                <tr key={l.id} className="border-b border-border/50">
                                    <td className="py-1.5 px-3 mono">{l.accountCode}</td>
                                    <td className="py-1.5 px-3">{l.accountName}</td>
                                    <td className="py-1.5 px-3 text-muted-foreground">{l.description ?? "—"}</td>
                                    <td className="py-1.5 px-3 mono text-right">{l.debit > 0 ? formatNGN(l.debit) : "—"}</td>
                                    <td className="py-1.5 px-3 mono text-right">{l.credit > 0 ? formatNGN(l.credit) : "—"}</td>
                                </tr>
                            ))}
                            <tr className="border-t border-border-strong bg-secondary/40">
                                <td colSpan={3} className="py-2 px-3 font-semibold text-right">Totals</td>
                                <td className="py-2 px-3 mono font-semibold text-right">{formatNGN(entry.totalDebit)}</td>
                                <td className="py-2 px-3 mono font-semibold text-right">{formatNGN(entry.totalCredit)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

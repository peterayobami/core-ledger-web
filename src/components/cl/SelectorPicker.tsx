import * as React from "react";
import { Phone, Mail, Search } from "lucide-react";
import { SlidePanel } from "./SlidePanel";
import { Avatar } from "./Avatar";
import { CustomerTypeTag } from "./Tag";
import { Button } from "./Button";
import { ShimmerBox } from "./Shimmer";
import { api } from "@/data/store";
import type { Customer, Vendor } from "@/data/types";
import { cn } from "@/lib/utils";

function SearchHeader({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cl-text-faded)]" />
            <input
                autoFocus
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-[44px] pl-9 pr-3 text-sm bg-[var(--cl-input)] rounded-[10px] border-0 outline-none placeholder:text-[#BEBEBE] focus:ring-[1.2px] focus:ring-[var(--cl-primary)]"
            />
        </div>
    );
}

function RowsShimmer() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                    <ShimmerBox width={36} height={36} radius={9999} />
                    <div className="flex-1 space-y-2">
                        <ShimmerBox width="60%" height={12} />
                        <ShimmerBox width="40%" height={10} />
                    </div>
                </div>
            ))}
        </div>
    );
}

interface VendorPickerProps {
    open: boolean;
    onClose: () => void;
    onBack: () => void;
    selectedId: string | null;
    onSelect: (vendor: Vendor) => void;
    title?: string;
}

export function VendorPicker({ open, onClose, onBack, selectedId, onSelect, title = "Select Vendor" }: VendorPickerProps) {
    const [search, setSearch] = React.useState("");
    const [items, setItems] = React.useState<Vendor[] | null>(null);
    const [pending, setPending] = React.useState<Vendor | null>(null);

    React.useEffect(() => {
        if (!open) return;
        setItems(null);
        let active = true;
        api.listVendors(search).then((r) => active && setItems(r));
        return () => { active = false; };
    }, [open, search]);

    return (
        <SlidePanel
            open={open}
            onClose={onClose}
            onBack={onBack}
            title={title}
            level={1}
            footer={
                <>
                    <Button variant="ghost" onClick={onBack}>Cancel</Button>
                    <Button disabled={!pending} onClick={() => { if (pending) { onSelect(pending); } }}>
                        Confirm Selection
                    </Button>
                </>
            }
        >
            <SearchHeader value={search} onChange={setSearch} placeholder="Search vendors…" />
            {items === null ? <RowsShimmer /> : items.length === 0 ? (
                <p className="text-sm text-center text-[var(--cl-text-muted)] py-10">No vendors found.</p>
            ) : (
                <div className="space-y-1">
                    {items.map((v) => {
                        const isActive = (pending?.id ?? selectedId) === v.id;
                        return (
                            <button
                                key={v.id}
                                onClick={() => setPending(v)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                    isActive ? "bg-[rgba(24,79,151,0.08)]" : "hover:bg-[var(--cl-bg)]"
                                )}
                            >
                                <Avatar name={v.name} variant="organization" size={40} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--cl-text)] truncate">{v.name}</p>
                                    <p className="text-xs text-[var(--cl-text-muted)] flex items-center gap-1.5 mt-0.5"><Phone size={11} /> <span className="mono">{v.phone}</span></p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </SlidePanel>
    );
}

interface CustomerPickerProps {
    open: boolean;
    onClose: () => void;
    onBack: () => void;
    selectedId: string | null;
    onSelect: (c: Customer) => void;
}

export function CustomerPicker({ open, onClose, onBack, selectedId, onSelect }: CustomerPickerProps) {
    const [search, setSearch] = React.useState("");
    const [items, setItems] = React.useState<Customer[] | null>(null);
    const [pending, setPending] = React.useState<Customer | null>(null);

    React.useEffect(() => {
        if (!open) return;
        setItems(null);
        let active = true;
        api.listCustomers(search).then((r) => active && setItems(r));
        return () => { active = false; };
    }, [open, search]);

    return (
        <SlidePanel
            open={open} onClose={onClose} onBack={onBack} title="Select Customer" level={1}
            footer={
                <>
                    <Button variant="ghost" onClick={onBack}>Cancel</Button>
                    <Button disabled={!pending} onClick={() => { if (pending) onSelect(pending); }}>Confirm Selection</Button>
                </>
            }
        >
            <SearchHeader value={search} onChange={setSearch} placeholder="Search customers…" />
            {items === null ? <RowsShimmer /> : items.length === 0 ? (
                <p className="text-sm text-center text-[var(--cl-text-muted)] py-10">No customers found.</p>
            ) : (
                <div className="space-y-1">
                    {items.map((c) => {
                        const isActive = (pending?.id ?? selectedId) === c.id;
                        const variant = c.type === "Individual" ? "individual" : "organization";
                        return (
                            <button
                                key={c.id} onClick={() => setPending(c)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                    isActive ? "bg-[rgba(24,79,151,0.08)]" : "hover:bg-[var(--cl-bg)]"
                                )}
                            >
                                <Avatar name={c.name} variant={variant} size={40} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-[var(--cl-text)] truncate">{c.name}</p>
                                        <CustomerTypeTag type={c.type} />
                                    </div>
                                    {c.email && (
                                        <p className="text-xs text-[var(--cl-text-muted)] flex items-center gap-1.5 mt-0.5"><Mail size={11} /> {c.email}</p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </SlidePanel>
    );
}

interface SelectorTriggerProps {
    value: string;
    placeholder: string;
    onClick: () => void;
    error?: boolean;
}

export function SelectorTrigger({ value, placeholder, onClick, error }: SelectorTriggerProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "w-full h-[44px] flex items-center justify-between px-3.5 text-sm bg-[var(--cl-input)] rounded-[10px] outline-none transition-all",
                "hover:bg-white hover:ring-[1.2px] hover:ring-[rgba(24,79,151,0.4)]",
                error && "ring-1 ring-[var(--cl-danger)]"
            )}
        >
            <span className={value ? "text-[var(--cl-text)]" : "text-[#BEBEBE]"}>{value || placeholder}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--cl-text-faded)]"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
    );
}

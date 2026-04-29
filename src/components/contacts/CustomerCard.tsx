import { Building2, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ColoredAvatar, PrimaryIconBadge } from "@/components/shared/Avatar";
import type { Customer, CustomerType } from "@/lib/models/customer";

const isOrg = (t: CustomerType) => t !== "Individual";

export function CustomerCard({ customer }: { customer: Customer }) {
    const org = isOrg(customer.type);
    return (
        <div className="cl-card p-3 flex flex-col">
            <div className="flex items-start justify-between gap-2">
                {org ? (
                    <PrimaryIconBadge size={36}>
                        <Building2 className="h-4 w-4" />
                    </PrimaryIconBadge>
                ) : (
                    <ColoredAvatar name={customer.fullName} size={36} />
                )}
                <span className="cl-tag text-[10px]">{customer.type}</span>
            </div>
            <div className="mt-2">
                <div className="font-semibold text-foreground text-sm truncate">{customer.fullName}</div>
                <div className="text-[11px] text-muted-foreground truncate">{customer.email}</div>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{customer.email}</span></div>
                <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" /><span className="truncate">{customer.phone}</span></div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border">
                <Link href={`/contacts/customers/${customer.id}`}>
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 text-xs h-8">
                        View Details
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export function CustomerCardShimmer() {
    return (
        <div className="cl-card p-3">
            <div className="flex justify-between">
                <div className="shimmer-box h-9 w-9 rounded-full" />
                <div className="shimmer-box h-4 w-16 rounded-full" />
            </div>
            <div className="mt-2 space-y-1.5">
                <div className="shimmer-box h-3.5 w-28" />
                <div className="shimmer-box h-3 w-36" />
            </div>
            <div className="mt-2 space-y-1.5">
                <div className="shimmer-box h-3 w-36" />
                <div className="shimmer-box h-3 w-24" />
            </div>
            <div className="mt-3 pt-2.5 border-t border-border">
                <div className="shimmer-box h-8 w-full" />
            </div>
        </div>
    );
}

import { Building2, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { ColoredAvatar, PrimaryIconBadge } from "@/components/shared/Avatar";
import type { Vendor } from "@/lib/models/vendor";

export function VendorCard({ vendor }: { vendor: Vendor }) {
    return (
        <Link
            href={`/contacts/vendors/${vendor.id}`}
            className="cl-card block p-0 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border">
                <PrimaryIconBadge size={30}>
                    <Building2 className="h-3.5 w-3.5" />
                </PrimaryIconBadge>
                <div className="font-semibold text-foreground truncate text-[13px]">
                    {vendor.companyName}
                </div>
            </div>
            {vendor.contact && (
                <div className="flex gap-2.5 p-3">
                    <ColoredAvatar name={vendor.contact.fullName} size={34} />
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-semibold text-foreground text-[13px] truncate">{vendor.contact.fullName}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{vendor.contact.role}</div>
                        {vendor.contact.email && (
                            <div className="flex items-center gap-1 text-[11px] text-primary mt-1">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{vendor.contact.email}</span>
                            </div>
                        )}
                        {vendor.contact.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-primary">
                                <Phone className="h-3 w-3 shrink-0" />
                                <span className="truncate">{vendor.contact.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Link>
    );
}

export function VendorCardShimmer() {
    return (
        <div className="cl-card p-0">
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border">
                <div className="shimmer-box h-[30px] w-[30px]" />
                <div className="shimmer-box h-3.5 w-36" />
            </div>
            <div className="flex gap-2.5 p-3">
                <div className="shimmer-box h-[34px] w-[34px] rounded-full" />
                <div className="space-y-1.5 flex-1">
                    <div className="shimmer-box h-3 w-28" />
                    <div className="shimmer-box h-3 w-20" />
                    <div className="shimmer-box h-3 w-36" />
                    <div className="shimmer-box h-3 w-24" />
                </div>
            </div>
        </div>
    );
}

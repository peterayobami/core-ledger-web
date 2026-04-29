import { Mail, Phone, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ColoredAvatar } from "@/components/shared/Avatar";
import { fullName, type HrEmployee } from "@/lib/models/employee";

export function EmployeeCard({ employee }: { employee: HrEmployee }) {
    const name = fullName(employee);
    return (
        <div className="cl-card overflow-hidden flex flex-col">
            <div className="relative h-11 bg-primary">
                <div className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2">
                    <ColoredAvatar name={name} size={56} ringWhite />
                </div>
            </div>
            <div className="pt-9 px-3 pb-3 flex-1 flex flex-col">
                <div className="text-center">
                    <div className="font-semibold text-foreground text-sm">{name}</div>
                    <div className="text-[11px] text-muted-foreground">{employee.department}</div>
                </div>
                <div className="mt-3 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-primary">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{employee.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <BadgeCheck className="h-3 w-3 shrink-0" />
                        <span className="truncate">{employee.id}</span>
                    </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border">
                    <Link href={`/contacts/employees/${employee.id}`}>
                        <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 text-xs h-8">
                            View Profile
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function EmployeeCardShimmer() {
    return (
        <div className="cl-card overflow-hidden">
            <div className="shimmer-box h-11 rounded-none" />
            <div className="px-3 pb-3 pt-8 space-y-1.5">
                <div className="shimmer-box h-3.5 w-28 mx-auto" />
                <div className="shimmer-box h-3 w-16 mx-auto" />
                <div className="shimmer-box h-3 w-36 mt-2" />
                <div className="shimmer-box h-3 w-28" />
                <div className="shimmer-box h-3 w-20" />
                <div className="shimmer-box h-8 w-full mt-2" />
            </div>
        </div>
    );
}

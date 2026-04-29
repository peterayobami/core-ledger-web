import { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";

export function ContactsLayout({
    title, children, headerRight,
}: { title: string; children: ReactNode; headerRight?: ReactNode }) {
    return (
        <>
            <PageHeader title={title} right={headerRight} />
            <main className="flex-1 px-6 pb-10">
                {children}
            </main>
        </>
    );
}

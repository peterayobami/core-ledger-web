import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export function ContactsLayout({
  title, children, headerRight,
}: { title: string; children: ReactNode; headerRight?: ReactNode }) {
  return (
    <AppShell>
      <PageHeader title={title} right={headerRight} />
      <main className="flex-1 overflow-y-auto px-6 pb-10">
        {children}
      </main>
    </AppShell>
  );
}

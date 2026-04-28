import { ReactNode } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PAYETabs } from "./PAYETabs";

export function PAYELayout({
  breadcrumbs, children, hideTabs,
}: { breadcrumbs: string[]; children: ReactNode; hideTabs?: boolean }) {
  return (
    <>
      <TopBar breadcrumbs={breadcrumbs} />
      {!hideTabs && <PAYETabs />}
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {children}
      </main>
    </>
  );
}

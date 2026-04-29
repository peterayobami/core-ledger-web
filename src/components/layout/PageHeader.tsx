import { ReactNode } from "react";
import { TopBar } from "./TopBar";

export function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
    return <TopBar title={title} />;
}

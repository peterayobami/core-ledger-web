import { OrgSettingsShell } from "@/components/settings/OrgSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";

export default function UsersPage() {
    return (
        <OrgSettingsShell title="Users & Permissions">
            <PageCard title="Team Members">
                <p className="text-sm text-muted-foreground py-8 text-center">
                    User management will be available when backend authentication is connected.
                </p>
            </PageCard>
        </OrgSettingsShell>
    );
}

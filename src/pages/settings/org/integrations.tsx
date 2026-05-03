import { OrgSettingsShell } from "@/components/settings/OrgSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";

export default function IntegrationsPage() {
    return (
        <OrgSettingsShell title="Integrations">
            <PageCard title="Connected Services">
                <p className="text-sm text-muted-foreground py-8 text-center">
                    Integrations (banking, payroll providers, etc.) will be configured here.
                </p>
            </PageCard>
        </OrgSettingsShell>
    );
}

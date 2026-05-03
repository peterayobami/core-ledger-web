import { UserSettingsShell } from "@/components/settings/UserSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function PrivacyPage() {
    return (
        <UserSettingsShell title="Privacy">
            <PageCard title="Data & Privacy">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Activity Logging</Label>
                            <p className="text-[12px] text-muted-foreground">Log your actions for audit trail purposes.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Profile Visibility</Label>
                            <p className="text-[12px] text-muted-foreground">Allow other team members to see your profile details.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </PageCard>
        </UserSettingsShell>
    );
}

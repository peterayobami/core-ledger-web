import { UserSettingsShell } from "@/components/settings/UserSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NotificationsPage() {
    return (
        <UserSettingsShell title="Notifications">
            <PageCard title="Email Notifications">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Transaction Alerts</Label>
                            <p className="text-[12px] text-muted-foreground">Get notified when a new transaction is posted.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Report Ready</Label>
                            <p className="text-[12px] text-muted-foreground">Notified when a scheduled report is generated.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>System Updates</Label>
                            <p className="text-[12px] text-muted-foreground">Product updates and maintenance notices.</p>
                        </div>
                        <Switch />
                    </div>
                </div>
            </PageCard>
        </UserSettingsShell>
    );
}

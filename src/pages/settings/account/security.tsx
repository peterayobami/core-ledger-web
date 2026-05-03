import { UserSettingsShell } from "@/components/settings/UserSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
    return (
        <UserSettingsShell title="Security">
            <PageCard title="Change Password">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                    <div className="md:col-span-2">
                        <Label>Current Password</Label>
                        <Input type="password" className="mt-1" />
                    </div>
                    <div>
                        <Label>New Password</Label>
                        <Input type="password" className="mt-1" />
                    </div>
                    <div>
                        <Label>Confirm New Password</Label>
                        <Input type="password" className="mt-1" />
                    </div>
                </div>
                <div className="mt-5">
                    <Button>Update Password</Button>
                </div>
            </PageCard>

            <PageCard title="Two-Factor Authentication">
                <p className="text-[13px] text-muted-foreground mb-3">
                    Add an extra layer of security to your account by enabling 2FA.
                </p>
                <Button variant="outline">Enable 2FA</Button>
            </PageCard>
        </UserSettingsShell>
    );
}

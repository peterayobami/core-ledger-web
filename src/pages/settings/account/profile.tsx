import { UserSettingsShell } from "@/components/settings/UserSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    return (
        <UserSettingsShell title="Profile">
            <PageCard title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Full Name</Label>
                        <Input defaultValue="John Doe" className="mt-1" />
                    </div>
                    <div>
                        <Label>Email Address</Label>
                        <Input defaultValue="john.doe@acme.co" type="email" className="mt-1" />
                    </div>
                    <div>
                        <Label>Phone Number</Label>
                        <Input defaultValue="+234 800 000 0000" className="mt-1" />
                    </div>
                    <div>
                        <Label>Job Title</Label>
                        <Input defaultValue="Finance Manager" className="mt-1" />
                    </div>
                </div>
                <div className="mt-5">
                    <Button>Save Changes</Button>
                </div>
            </PageCard>
        </UserSettingsShell>
    );
}

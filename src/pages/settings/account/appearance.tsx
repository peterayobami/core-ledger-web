import { UserSettingsShell } from "@/components/settings/UserSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function AppearancePage() {
    return (
        <UserSettingsShell title="Appearance">
            <PageCard title="Theme & Display">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                    <div>
                        <Label>Theme</Label>
                        <Select defaultValue="light">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Date Format</Label>
                        <Select defaultValue="dd/mm/yyyy">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </PageCard>
        </UserSettingsShell>
    );
}

import { OrgSettingsShell } from "@/components/settings/OrgSettingsShell";
import { PageCard } from "@/components/reports/ReportPrimitives";
import { useOrgSettings } from "@/stores/org-settings.store";
import type { CompanyType } from "@/stores/org-settings.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const COMPANY_TYPES: CompanyType[] = [
    "Private Limited (Ltd)",
    "Public Limited Company (PLC)",
    "Limited Liability Partnership (LLP)",
    "Partnership",
    "Sole Proprietorship",
    "Non-Governmental Organisation (NGO)",
    "Other",
];

export default function CompanyProfilePage() {
    const company = useOrgSettings(s => s.company);
    const updateCompany = useOrgSettings(s => s.updateCompany);
    const [draft, setDraft] = useState(company);

    function save() {
        if (!draft.name.trim()) { toast.error("Company name is required."); return; }
        if (!draft.tin.trim()) { toast.error("Tax Identification Number (TIN) is required."); return; }
        updateCompany(draft);
        toast.success("Company profile updated");
        // 🔌 BACKEND: PUT /api/settings/company
    }

    return (
        <OrgSettingsShell title="Company Profile">
            <div className="space-y-6">
                <PageCard title="Legal Identity">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label>Company Name <span className="text-danger">*</span></Label>
                            <Input
                                value={draft.name}
                                onChange={e => setDraft({ ...draft, name: e.target.value })}
                                placeholder="e.g. Acme Industries Limited"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Company Type <span className="text-danger">*</span></Label>
                            <Select
                                value={draft.companyType}
                                onValueChange={v => setDraft({ ...draft, companyType: v as CompanyType })}
                            >
                                <SelectTrigger className="bg-card mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {COMPANY_TYPES.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Determines applicable tax regime (CIT for Ltd/PLC; PIT for partnerships/sole proprietors).
                            </p>
                        </div>

                        <div>
                            <Label>CAC Registration Number</Label>
                            <Input
                                value={draft.registrationNumber}
                                onChange={e => setDraft({ ...draft, registrationNumber: e.target.value })}
                                placeholder="e.g. RC-1234567"
                                className="mt-1 mono"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Corporate Affairs Commission registration number.
                            </p>
                        </div>

                        <div>
                            <Label>Tax Identification Number (TIN) <span className="text-danger">*</span></Label>
                            <Input
                                value={draft.tin}
                                onChange={e => setDraft({ ...draft, tin: e.target.value })}
                                placeholder="e.g. 12345678-0001"
                                className="mt-1 mono"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                                FIRS-issued TIN. Required on all tax filings, VAT invoices, and official correspondence.
                            </p>
                        </div>

                        <div>
                            <Label>Industry / Sector</Label>
                            <Input
                                value={draft.industry}
                                onChange={e => setDraft({ ...draft, industry: e.target.value })}
                                placeholder="e.g. Manufacturing"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </PageCard>

                <PageCard title="Contact Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label>Registered Address</Label>
                            <Textarea
                                value={draft.address}
                                rows={2}
                                onChange={e => setDraft({ ...draft, address: e.target.value })}
                                placeholder="Street address, city, state, Nigeria"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Phone Number</Label>
                            <Input
                                value={draft.phone ?? ""}
                                onChange={e => setDraft({ ...draft, phone: e.target.value })}
                                placeholder="+234 800 000 0000"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Email Address</Label>
                            <Input
                                type="email"
                                value={draft.email ?? ""}
                                onChange={e => setDraft({ ...draft, email: e.target.value })}
                                placeholder="finance@company.com"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </PageCard>

                <PageCard title="Accounting Period">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Fiscal Year Start Month</Label>
                            <Select
                                value={String(draft.fiscalYearStartMonth)}
                                onValueChange={v => setDraft({ ...draft, fiscalYearStartMonth: Number(v) })}
                            >
                                <SelectTrigger className="bg-card mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m, i) => (
                                        <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Used to auto-calculate fiscal year start and end dates. Most Nigerian companies use January.
                            </p>
                        </div>

                        <div>
                            <Label>Company Logo URL (optional)</Label>
                            <Input
                                value={draft.logoUrl ?? ""}
                                onChange={e => setDraft({ ...draft, logoUrl: e.target.value || undefined })}
                                placeholder="https://…"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </PageCard>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDraft(company)}>Reset</Button>
                    <Button onClick={save} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Save Changes
                    </Button>
                </div>
            </div>
        </OrgSettingsShell>
    );
}

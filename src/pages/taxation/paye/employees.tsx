import { useMemo, useState, useEffect } from "react";
import { PAYELayout } from "@/components/paye/PAYELayout";
import { BandChip } from "@/components/paye/RunStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { CURRENT_PERIOD, periodLong } from "@/lib/mock-data/paye";
import { computePaye, formatNGN, formatNGNCompact, formatPct } from "@/lib/services/paye.service";
import { usePayeEmployees, useSavePayeProfile } from "@/hooks/paye/use-employees";
import type { Employee, PayeProfile } from "@/lib/models/paye";
import {
  Search, ShieldCheck, Upload, RotateCcw, Save, ChevronRight,
  AlertCircle, Users, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATES = ["Lagos", "FCT Abuja", "Rivers", "Oyo", "Kano", "Kaduna", "Akwa Ibom", "Enugu", "Anambra", "Delta"];

export default function Employees() {
  const { data: employees = [] } = usePayeEmployees();
  const saveProfile = useSavePayeProfile();

  const [selected, setSelected] = useState<Employee | null>(null);
  const [profile, setProfile] = useState<PayeProfile | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Auto-select first employee once data loads
  useEffect(() => {
    if (!selected && employees.length > 0) {
      setSelected(employees[0]);
      setProfile(employees[0].profile);
    }
  }, [employees]);

  // Reset form when employee changes
  useEffect(() => {
    if (selected) setProfile(selected.profile);
  }, [selected?.id]);

  const computation = useMemo(
    () => profile ? computePaye(profile) : null,
    [profile],
  );

  if (!selected || !profile || !computation) return null;

  return (
    <PAYELayout breadcrumbs={["Taxation", "PAYE", "Employee Setup"]}>
      <PeriodHeader />

      <div>
        <h1 className="text-xl font-semibold">Employee PAYE Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure individual employee tax computation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Setup form */}
        <div className="lg:col-span-8 space-y-4">

          {/* Employee selector */}
          <div
            role="button"
            onClick={() => setPickerOpen(true)}
            className="data-card p-4 flex items-center gap-3 cursor-pointer hover:bg-secondary/30 transition-colors group sticky top-[108px] z-10"
          >
            <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground grid place-items-center text-sm font-semibold shrink-0">
              {selected.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{selected.name}</div>
              <div className="text-xs text-muted-foreground">{selected.department}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              <Users className="h-3.5 w-3.5" />
              <span>Change</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>

          <SetupForm
            employee={selected}
            profile={profile}
            setProfile={setProfile}
            onSave={() => saveProfile.mutate({ id: selected.id, profile })}
            isSaving={saveProfile.isPending}
          />
        </div>

        {/* Live PAYE Preview — sticky right */}
        <div className="lg:col-span-4 sticky top-[108px]">
          <div className="data-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Live PAYE Preview</h3>
                <p className="text-[11px] text-muted-foreground">Real-time computation</p>
              </div>
              <BandChip rate={computation.isExempt ? 0 : computation.highestBand} />
            </div>

            <Row label="Gross Annual Income" value={formatNGN(computation.grossAnnual)} />
            <Row label="Less: Pension (8%)" value={`-${formatNGN(computation.pension)}`} dim />
            <Row label="Less: NHF (2.5%)" value={`-${formatNGN(computation.nhf)}`} dim />
            {computation.rentRelief > 0 && (
              <Row label="Less: Rent Relief" value={`-${formatNGN(computation.rentRelief)}`} dim />
            )}
            <div className="border-t border-border pt-2">
              <Row label="Chargeable Income" value={formatNGN(computation.chargeableAnnual)} bold />
            </div>

            <div className="rounded-md bg-accent-soft border border-accent/20 p-3 space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-accent font-semibold">PAYE Computation</div>
              <Row label="Tax Band" value={`${computation.isExempt ? 0 : computation.highestBand}%`} />
              <Row label="Annual PAYE" value={formatNGN(computation.annualPaye)} bold />
              <Row label="Monthly PAYE" value={formatNGN(computation.monthlyPaye)} bold />
              <Row label="Effective Tax Rate" value={formatPct(computation.etr)} />
            </div>

            {!profile.tin && (
              <div className="rounded-md bg-warning-soft border border-warning/30 p-2.5 text-[11px] text-warning flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Missing TIN — required before this profile can be included in Form H1.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Employee picker sheet */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="right" className="w-[360px] sm:max-w-[360px] p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
            <SheetTitle className="text-sm">Select Employee</SheetTitle>
          </SheetHeader>
          <EmployeePicker
            employees={employees}
            selected={selected}
            onSelect={(e) => { setSelected(e); setPickerOpen(false); }}
          />
        </SheetContent>
      </Sheet>
    </PAYELayout>
  );
}

function EmployeePicker({
  employees, selected, onSelect,
}: {
  employees: Employee[];
  selected: Employee | null;
  onSelect: (e: Employee) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return employees;
    const s = search.toLowerCase();
    return employees.filter(e =>
      e.name.toLowerCase().includes(s) ||
      e.department.toLowerCase().includes(s) ||
      e.id.toLowerCase().includes(s),
    );
  }, [search, employees]);

  return (
    <>
      <div className="px-4 py-3 border-b border-border shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search employee…"
            className="h-9 pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((e) => {
          const isSelected = selected?.id === e.id;
          const c = e.profile.hasProfile ? computePaye(e.profile) : null;
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-border/60 transition-colors flex items-center gap-3",
                isSelected ? "bg-accent-soft" : "hover:bg-secondary/40",
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-full grid place-items-center text-xs font-semibold shrink-0",
                isSelected ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground/70",
              )}>
                {e.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{e.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{e.department}</div>
              </div>
              {c && <BandChip rate={c.isExempt ? 0 : c.highestBand} />}
              {!e.profile.hasProfile && (
                <span className="text-[10px] font-medium text-warning bg-warning-soft px-1.5 py-0.5 rounded">
                  Setup
                </span>
              )}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </>
  );
}

function PeriodHeader() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span>Period: <span className="font-medium text-foreground">{periodLong(CURRENT_PERIOD)}</span></span>
      <span>·</span>
      <span>Company: <span className="font-medium text-foreground">Bechellente Ltd</span></span>
    </div>
  );
}

function SetupForm({
  employee, profile, setProfile, onSave, isSaving,
}: {
  employee: Employee;
  profile: PayeProfile;
  setProfile: React.Dispatch<React.SetStateAction<PayeProfile>>;
  onSave: () => void;
  isSaving: boolean;
}) {
  const monthly = (n: number) => Math.round(n / 12);
  const setMonthly = <K extends keyof PayeProfile>(key: K) => (v: number) => {
    setProfile(p => ({ ...p, [key]: Math.round(v * 12) as PayeProfile[K], hasProfile: true }));
  };

  const pensionableAnnual = profile.basic + profile.housing + profile.transport;
  const pensionMonthly = Math.round((pensionableAnnual * 0.08) / 12);
  const nhfMonthly = Math.round((profile.basic * 0.025) / 12);
  const rentReliefAnnual = profile.rentReliefApproved
    ? Math.min(profile.rentPaid * 0.20, 500_000) : 0;

  return (
    <div className="space-y-4">
      {/* Income Structure */}
      <section className="data-card p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Income Structure</h3>
          <p className="text-[11px] text-muted-foreground">Monthly emoluments breakdown</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Basic Salary (Pensionable)" value={monthly(profile.basic)} onChange={setMonthly("basic")} />
          <Field label="Housing Allowance (Pensionable)" value={monthly(profile.housing)} onChange={setMonthly("housing")} />
          <Field label="Transport Allowance (Pensionable)" value={monthly(profile.transport)} onChange={setMonthly("transport")} />
          <Field label="Other Allowances" value={monthly(profile.other)} onChange={setMonthly("other")} />
        </div>
        <div className="rounded-md bg-accent-soft border border-accent/20 px-3 py-2 text-[11px] text-accent font-medium flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          Pensionable emoluments: {formatNGN(pensionableAnnual)} / year
        </div>
      </section>

      {/* Statutory Deductions */}
      <section className="data-card p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Statutory Deductions</h3>
          <p className="text-[11px] text-muted-foreground">Mandatory NTA 2025 deductions</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ReadOnly label="Pension (8% of Pensionable)" value={formatNGN(pensionMonthly)} />
          <ReadOnly label="NHF (2.5% of Basic)" value={formatNGN(nhfMonthly)} />
        </div>
      </section>

      {/* Rent Relief */}
      <section className="data-card p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Rent Relief Module</h3>
          <p className="text-[11px] text-muted-foreground">NTA 2025 rent relief calculation</p>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <div className="text-xs font-medium">Employee pays rent</div>
            <div className="text-[11px] text-muted-foreground">Toggle to enable rent relief</div>
          </div>
          <Switch
            checked={profile.rentReliefApproved}
            onCheckedChange={(v) => setProfile(p => ({ ...p, rentReliefApproved: v, hasProfile: true }))}
          />
        </div>
        {profile.rentReliefApproved && (
          <>
            <Field
              label="Annual Rent Paid"
              value={profile.rentPaid}
              onChange={(v) => setProfile(p => ({ ...p, rentPaid: v, hasProfile: true }))}
            />
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Rent Receipt Document</Label>
              <div className="mt-1.5 rounded-md border border-dashed border-border p-6 text-center cursor-pointer hover:bg-secondary/30 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
                <div className="text-xs font-medium">Click to upload rent receipt</div>
                <div className="text-[11px] text-muted-foreground">PDF, JPG, PNG up to 5MB</div>
              </div>
            </div>
            <div className="rounded-md bg-accent-soft border border-accent/20 px-3 py-2 text-[11px] text-accent font-medium space-y-0.5">
              <div>Deductible Rent Relief: {formatNGN(rentReliefAnnual)}</div>
              <div className="text-accent/80 font-normal">
                = min(20% × {formatNGNCompact(profile.rentPaid)}, ₦500,000 cap)
              </div>
            </div>
          </>
        )}
      </section>

      {/* Residency */}
      <section className="data-card p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Residency &amp; Other Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Tax Residency Status</Label>
            <Select
              value={profile.residency}
              onValueChange={(v: "Resident" | "Non-Resident") => setProfile(p => ({ ...p, residency: v, hasProfile: true }))}
            >
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Resident">Resident (Worldwide Income)</SelectItem>
                <SelectItem value="Non-Resident">Non-Resident (Nigeria-source only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">State of Residence (for remittance routing)</Label>
            <Select
              value={profile.state}
              onValueChange={(v) => setProfile(p => ({ ...p, state: v, hasProfile: true }))}
            >
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">TIN</Label>
            <Input
              value={profile.tin ?? ""}
              onChange={(e) => setProfile(p => ({ ...p, tin: e.target.value || null, hasProfile: true }))}
              placeholder="10 digits"
              className="h-9 font-mono text-sm"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => setProfile(employee.profile)} disabled={isSaving}>
          <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reset to Defaults
        </Button>
        <Button
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-3.5 w-3.5 mr-2" />
          {isSaving ? "Saving…" : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        className="h-9 font-mono text-sm tabular-nums"
      />
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="h-9 px-3 rounded-md border border-border bg-secondary/40 flex items-center font-mono text-sm tabular-nums text-foreground/90">
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, dim, bold }: { label: string; value: string; dim?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className={cn("text-foreground/85", dim && "text-muted-foreground")}>{label}</span>
      <span className={cn(
        "font-mono tabular-nums",
        bold && "font-semibold",
        dim && "text-muted-foreground",
      )}>{value}</span>
    </div>
  );
}

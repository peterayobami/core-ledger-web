import { useMemo, useState } from "react";
import { PAYELayout } from "@/components/paye/PAYELayout";
import { KpiCard } from "@/components/ca/KpiCard";
import { BandChip } from "@/components/paye/RunStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  EMPLOYEES, computePaye, formatNGN, formatNGNCompact, formatPct,
  PAYE_BANDS, type Employee, type PayeProfile,
} from "@/lib/paye-data";
import { Search, UserPlus, ChevronRight, AlertCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Employees() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Employee | null>(EMPLOYEES[0]);

  const filtered = useMemo(() => {
    if (!search) return EMPLOYEES;
    const s = search.toLowerCase();
    return EMPLOYEES.filter(e =>
      e.name.toLowerCase().includes(s) ||
      e.department.toLowerCase().includes(s) ||
      e.id.toLowerCase().includes(s),
    );
  }, [search]);

  const stats = useMemo(() => {
    const configured = EMPLOYEES.filter(e => e.profile.hasProfile);
    const total = EMPLOYEES.length;
    const missingTin = EMPLOYEES.filter(e => e.profile.hasProfile && !e.profile.tin).length;
    const exempt = configured.filter(e => computePaye(e.profile).isExempt).length;
    return { total, configured: configured.length, missingTin, exempt };
  }, []);

  return (
    <PAYELayout breadcrumbs={["Taxation", "PAYE", "Employees"]}>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Employees</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage PAYE profiles and preview tax computations live.
          </p>
        </div>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <UserPlus className="h-3.5 w-3.5 mr-2" /> Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Employees" value={stats.total} sublabel="On payroll" />
        <KpiCard label="Configured Profiles" value={`${stats.configured} / ${stats.total}`} sublabel="Ready for payroll run" />
        <KpiCard label="Missing TIN" value={stats.missingTin} sublabel="Required for Form H1" />
        <KpiCard label="Exempt (≤ ₦800K)" value={stats.exempt} sublabel="Below first taxable band" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Employee list */}
        <div className="lg:col-span-4 data-card overflow-hidden flex flex-col max-h-[720px]">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search name, dept, ID…"
                className="h-9 pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                  onClick={() => setSelected(e)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border/60 transition-colors",
                    "flex items-center gap-3",
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
                    <div className="text-[11px] text-muted-foreground truncate">
                      {e.department} · <span className="font-mono">{e.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!e.profile.hasProfile ? (
                      <span className="text-[10px] font-medium text-warning bg-warning-soft px-1.5 py-0.5 rounded">
                        Setup
                      </span>
                    ) : c ? (
                      <BandChip rate={c.isExempt ? 0 : c.highestBand} />
                    ) : null}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail / form */}
        <div className="lg:col-span-8">
          {selected ? <EmployeeDetail employee={selected} /> : (
            <div className="data-card p-12 text-center text-sm text-muted-foreground">
              Select an employee to view their PAYE profile.
            </div>
          )}
        </div>
      </div>
    </PAYELayout>
  );
}

function EmployeeDetail({ employee }: { employee: Employee }) {
  const [profile, setProfile] = useState<PayeProfile>(employee.profile);
  const computation = useMemo(() => computePaye(profile), [profile]);

  // re-init on selection change
  useMemo(() => setProfile(employee.profile), [employee.id]);

  const update = <K extends keyof PayeProfile>(key: K, value: PayeProfile[K]) => {
    setProfile(p => ({ ...p, [key]: value, hasProfile: true }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="data-card p-5 flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-accent text-accent-foreground grid place-items-center text-base font-semibold">
            {employee.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h2 className="text-base font-semibold">{employee.name}</h2>
            <p className="text-xs text-muted-foreground">
              {employee.department} · <span className="font-mono">{employee.id}</span> · {employee.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!profile.tin ? (
            <span className="text-[11px] inline-flex items-center gap-1 text-warning bg-warning-soft border border-warning/30 px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3" /> Missing TIN
            </span>
          ) : (
            <span className="text-[11px] inline-flex items-center gap-1 text-success bg-success-soft border border-success/30 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" /> TIN verified
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Form */}
        <div className="xl:col-span-3 space-y-4">
          <section className="data-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Annual Emoluments</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Basic" value={profile.basic} onChange={(v) => update("basic", v)} />
              <Field label="Housing" value={profile.housing} onChange={(v) => update("housing", v)} />
              <Field label="Transport" value={profile.transport} onChange={(v) => update("transport", v)} />
              <Field label="Other allowances" value={profile.other} onChange={(v) => update("other", v)} />
            </div>
            <div className="text-[11px] text-muted-foreground">
              Pension applies to Basic + Housing + Transport (8%). NHF applies to Basic only (2.5%).
            </div>
          </section>

          <section className="data-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Reliefs & Deductions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Annual rent paid" value={profile.rentPaid} onChange={(v) => update("rentPaid", v)} />
              <Field label="Life insurance premium" value={profile.lifeInsurance} onChange={(v) => update("lifeInsurance", v)} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="text-xs font-medium">Rent relief approved</div>
                <div className="text-[11px] text-muted-foreground">20% of rent, capped at ₦500,000/yr</div>
              </div>
              <Switch
                checked={profile.rentReliefApproved}
                onCheckedChange={(v) => update("rentReliefApproved", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="text-xs font-medium">NHIS opt-in</div>
                <div className="text-[11px] text-muted-foreground">Voluntary health insurance contribution</div>
              </div>
              <Switch
                checked={profile.nhisOptIn}
                onCheckedChange={(v) => update("nhisOptIn", v)}
              />
            </div>
            {profile.nhisOptIn && (
              <Field label="NHIS amount (annual)" value={profile.nhisAmount} onChange={(v) => update("nhisAmount", v)} />
            )}
          </section>

          <section className="data-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Tax Identity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">TIN</Label>
                <Input
                  value={profile.tin ?? ""}
                  onChange={(e) => update("tin", e.target.value || null)}
                  placeholder="10 digits"
                  className="h-9 font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">State of residence</Label>
                <Input
                  value={profile.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setProfile(employee.profile)}>Reset</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Save Profile
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div className="xl:col-span-2 space-y-4">
          <div className="data-card p-5 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Live PAYE Preview</h3>
              <BandChip rate={computation.isExempt ? 0 : computation.highestBand} />
            </div>

            <div className="space-y-3">
              <div className="rounded-md bg-secondary/50 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly PAYE</div>
                <div className="font-mono text-2xl font-semibold tabular-nums mt-0.5">
                  {formatNGN(computation.monthlyPaye)}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Annual: <span className="font-mono">{formatNGN(computation.annualPaye)}</span> · ETR {formatPct(computation.etr)}
                </div>
              </div>

              <Row label="Gross annual" value={formatNGNCompact(computation.grossAnnual)} />
              <Row label="Pension (8%)" value={`-${formatNGNCompact(computation.pension)}`} dim />
              <Row label="NHF (2.5%)" value={`-${formatNGNCompact(computation.nhf)}`} dim />
              {computation.nhis > 0 && <Row label="NHIS" value={`-${formatNGNCompact(computation.nhis)}`} dim />}
              {computation.rentRelief > 0 && <Row label="Rent relief" value={`-${formatNGNCompact(computation.rentRelief)}`} dim />}
              {computation.lifeInsurance > 0 && <Row label="Life insurance" value={`-${formatNGNCompact(computation.lifeInsurance)}`} dim />}
              <div className="border-t border-border pt-2">
                <Row label="Chargeable income" value={formatNGNCompact(computation.chargeableAnnual)} bold />
              </div>

              {/* Band ladder */}
              <div className="pt-3 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Band breakdown</div>
                <div className="space-y-1">
                  {PAYE_BANDS.map((b) => {
                    const split = computation.bandSplits.find(s => s.rate === b.rate);
                    const used = !!split;
                    return (
                      <div key={b.rate} className={cn(
                        "flex items-center gap-2 text-[11px] py-0.5",
                        !used && "opacity-40",
                      )}>
                        <BandChip rate={b.rate} />
                        <span className="font-mono text-muted-foreground flex-1">
                          {split ? formatNGNCompact(split.income) : "—"}
                        </span>
                        <span className="font-mono font-medium w-20 text-right">
                          {split ? formatNGNCompact(split.tax) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <Row label="Monthly net pay" value={formatNGN(computation.monthlyNet)} bold large />
              </div>

              {computation.isExempt && (
                <div className="rounded-md bg-success-soft border border-success/30 p-2.5 text-[11px] text-success">
                  <ShieldCheck className="h-3.5 w-3.5 inline mr-1.5" />
                  Exempt — chargeable income at or below ₦800,000.
                </div>
              )}
            </div>
          </div>
        </div>
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

function Row({ label, value, dim, bold, large }: { label: string; value: string; dim?: boolean; bold?: boolean; large?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className={cn("text-foreground/80", dim && "text-muted-foreground")}>{label}</span>
      <span className={cn(
        "font-mono tabular-nums",
        bold && "font-semibold",
        large && "text-base",
        dim && "text-muted-foreground",
      )}>{value}</span>
    </div>
  );
}

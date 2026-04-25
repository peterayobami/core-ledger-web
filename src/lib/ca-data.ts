// Mock data + helpers for Capital Allowance module
export type CAStatus = "not_computed" | "computed" | "locked";

export type Classification = {
  id: number;
  name: string;
  shortName: string;
  aaRate: number; // percent
  usefulLife: number | null; // years, null = N/A
  depreciationRate: number; // percent
  description: string;
  group: "building" | "furniture" | "machinery" | "vehicle" | "tech" | "infra" | "other";
};

export const CLASSIFICATIONS: Classification[] = [
  { id: 1, name: "Building (Industrial & Non Industrial)", shortName: "Buildings", aaRate: 10, usefulLife: 10, depreciationRate: 5, description: "Office, factory, warehouse and industrial structures owned by the entity.", group: "building" },
  { id: 2, name: "Furniture & Fittings", shortName: "Furniture & Fittings", aaRate: 20, usefulLife: 5, depreciationRate: 20, description: "Office furniture, partitions, shelving, decor and built-in fittings.", group: "furniture" },
  { id: 3, name: "Plant & Machinery", shortName: "Plant & Machinery", aaRate: 25, usefulLife: 4, depreciationRate: 25, description: "Industrial production equipment, generators, factory plant and tooling.", group: "machinery" },
  { id: 4, name: "Plant & Machinery (Agriculture)", shortName: "P&M — Agriculture", aaRate: 0, usefulLife: null, depreciationRate: 25, description: "Agricultural machinery — no annual allowance under NTA 2025.", group: "machinery" },
  { id: 5, name: "Mining Assets", shortName: "Mining Assets", aaRate: 0, usefulLife: null, depreciationRate: 20, description: "Extractive sector capital assets — IA abolished by NTA 2025.", group: "other" },
  { id: 6, name: "Motor Vehicle", shortName: "Motor Vehicle", aaRate: 25, usefulLife: 4, depreciationRate: 25, description: "Company cars, vans and light commercial vehicles.", group: "vehicle" },
  { id: 7, name: "Motor Vehicle (3+ fleet, Public Transportation)", shortName: "MV Fleet (Public)", aaRate: 0, usefulLife: null, depreciationRate: 25, description: "Public transport fleet of 3+ vehicles — no annual allowance.", group: "vehicle" },
  { id: 8, name: "Research and Development", shortName: "R&D", aaRate: 0, usefulLife: null, depreciationRate: 20, description: "R&D capitalised expenditure — no annual allowance.", group: "other" },
  { id: 9, name: "Office Equipment", shortName: "Office Equipment", aaRate: 20, usefulLife: 5, depreciationRate: 20, description: "Printers, copiers, conference and small office hardware.", group: "tech" },
  { id: 10, name: "Computer Equipment", shortName: "Computer Equipment", aaRate: 20, usefulLife: 5, depreciationRate: 25, description: "Workstations, servers, laptops and peripherals.", group: "tech" },
  { id: 11, name: "Communication Infrastructure", shortName: "Comm Infrastructure", aaRate: 10, usefulLife: 10, depreciationRate: 10, description: "Telecom equipment, towers, network backhaul and switching gear.", group: "infra" },
];

export const groupColor = (g: Classification["group"]): string => {
  switch (g) {
    case "building": return "hsl(var(--chart-blue))";
    case "furniture": return "hsl(var(--chart-indigo))";
    case "machinery": return "hsl(var(--chart-emerald))";
    case "vehicle": return "hsl(var(--chart-teal))";
    case "tech": return "hsl(var(--chart-violet))";
    case "infra": return "hsl(var(--chart-rose))";
    default: return "hsl(var(--chart-slate))";
  }
};

export type ScheduleRow = {
  classificationId: number;
  twdvBf: number;
  additions: number;
  poolCost: number;
  annualAllowance: number;
  retentionFloor: number;
  twdvCf: number;
};

export type CAYear = {
  fiscalYear: number;
  assessmentYear: number;
  status: CAStatus;
  lockedAt?: string;
  lockedBy?: string;
  rows: ScheduleRow[];
  unrecoupedBf: number;
  // Tax computation
  grossIncome: number;
  costOfSales: number;
  expenses: number;
  depreciationAddback: number;
  citRate?: number;
  caRelieved?: number;
  citPayable?: number;
};

// Build a deterministic schedule for a year
const baseAdditions: Record<number, number> = {
  1: 25_000_000, 2: 4_000_000, 3: 12_000_000, 4: 0, 5: 0,
  6: 6_500_000, 7: 0, 8: 0, 9: 3_500_000, 10: 8_600_000, 11: 6_000_000,
};

function buildRows(yearOffset: number, growth = 1): ScheduleRow[] {
  return CLASSIFICATIONS.map((c) => {
    const additions = Math.round(baseAdditions[c.id] * growth);
    const twdvBf = Math.round(additions * Math.max(0.6 - yearOffset * 0.1, 0));
    const poolCost = additions + Math.round(additions * 0.1 * yearOffset);
    const base = twdvBf + additions;
    const annualAllowance = Math.round(base * (c.aaRate / 100));
    const retentionFloor = Math.round(poolCost * 0.01);
    const twdvCfRaw = base - annualAllowance;
    const twdvCf = c.aaRate === 0 ? base : Math.max(twdvCfRaw, retentionFloor);
    return { classificationId: c.id, twdvBf, additions, poolCost, annualAllowance, retentionFloor, twdvCf };
  });
}

export const YEARS: CAYear[] = [
  {
    fiscalYear: 2021, assessmentYear: 2022, status: "locked",
    lockedAt: "2022-04-12", lockedBy: "Admin",
    rows: buildRows(4, 0.7), unrecoupedBf: 0,
    grossIncome: 180_000_000, costOfSales: 90_000_000, expenses: 35_000_000, depreciationAddback: 8_000_000,
    citRate: 30, caRelieved: 9_800_000, citPayable: 16_260_000,
  },
  {
    fiscalYear: 2022, assessmentYear: 2023, status: "locked",
    lockedAt: "2023-04-22", lockedBy: "Admin",
    rows: buildRows(3, 0.85), unrecoupedBf: 200_000,
    grossIncome: 210_000_000, costOfSales: 102_000_000, expenses: 41_000_000, depreciationAddback: 9_500_000,
    citRate: 30, caRelieved: 9_100_000, citPayable: 23_220_000,
  },
  {
    fiscalYear: 2023, assessmentYear: 2024, status: "locked",
    lockedAt: "2024-04-18", lockedBy: "Admin",
    rows: buildRows(2, 0.95), unrecoupedBf: 280_000,
    grossIncome: 245_000_000, costOfSales: 118_000_000, expenses: 47_000_000, depreciationAddback: 10_500_000,
    citRate: 30, caRelieved: 8_400_000, citPayable: 27_510_000,
  },
  {
    fiscalYear: 2024, assessmentYear: 2025, status: "locked",
    lockedAt: "2025-04-09", lockedBy: "Admin",
    rows: buildRows(1, 1), unrecoupedBf: 320_000,
    grossIncome: 268_000_000, costOfSales: 128_000_000, expenses: 52_000_000, depreciationAddback: 11_200_000,
    citRate: 30, caRelieved: 8_100_000, citPayable: 29_280_000,
  },
  {
    fiscalYear: 2025, assessmentYear: 2026, status: "computed",
    rows: buildRows(0, 1.05), unrecoupedBf: 350_000,
    grossIncome: 295_000_000, costOfSales: 138_000_000, expenses: 58_000_000, depreciationAddback: 12_000_000,
    citRate: 30,
  },
];

// Currency formatters
export function formatNGN(n: number, opts: { negate?: boolean } = {}): string {
  const v = Math.abs(n);
  const formatted = v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n < 0 || opts.negate) return `(₦${formatted})`;
  return `₦${formatted}`;
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function getYear(fy: number): CAYear | undefined {
  return YEARS.find((y) => y.fiscalYear === fy);
}

export function totalAA(y: CAYear): number {
  return y.rows.reduce((s, r) => s + r.annualAllowance, 0);
}
export function totalPoolCost(y: CAYear): number {
  return y.rows.reduce((s, r) => s + r.poolCost, 0);
}
export function totalTwdvCf(y: CAYear): number {
  return y.rows.reduce((s, r) => s + r.twdvCf, 0);
}
export function totalTwdvBf(y: CAYear): number {
  return y.rows.reduce((s, r) => s + r.twdvBf, 0);
}
export function totalAdditions(y: CAYear): number {
  return y.rows.reduce((s, r) => s + r.additions, 0);
}

// Tax computation derived
export function taxComputation(y: CAYear) {
  const adjustedProfit = y.grossIncome - y.costOfSales - y.expenses + y.depreciationAddback;
  const aa = totalAA(y);
  const totalCAAvailable = y.unrecoupedBf + aa;
  const caRelieved = Math.min(totalCAAvailable, Math.max(adjustedProfit, 0));
  const unrecoupedCf = totalCAAvailable - caRelieved;
  const assessableIncome = Math.max(adjustedProfit - caRelieved, 0);
  // CIT bands per NTA 2025
  let band: "Small" | "Medium" | "Large", citRate: number;
  if (y.grossIncome <= 25_000_000) { band = "Small"; citRate = 0; }
  else if (y.grossIncome <= 100_000_000) { band = "Medium"; citRate = 20; }
  else { band = "Large"; citRate = 30; }
  const citPayable = Math.round(assessableIncome * (citRate / 100));
  const effectiveTaxRate = adjustedProfit > 0 ? (citPayable / adjustedProfit) * 100 : 0;
  return { adjustedProfit, aa, totalCAAvailable, caRelieved, unrecoupedCf, assessableIncome, band, citRate, citPayable, effectiveTaxRate };
}

export const CURRENT_FY = 2025;

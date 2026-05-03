// 🔌 BACKEND: GET/POST /api/settings/opening-balances?year= and
// /api/settings/company, /api/settings/fiscal-years, /api/settings/tax-config.
// This zustand store is a frontend-only cache; production reads/writes
// the values via the endpoints above.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CompanyType =
    | "Private Limited (Ltd)"
    | "Public Limited Company (PLC)"
    | "Limited Liability Partnership (LLP)"
    | "Partnership"
    | "Sole Proprietorship"
    | "Non-Governmental Organisation (NGO)"
    | "Other";

export interface CompanyProfile {
    name: string;
    companyType: CompanyType;
    registrationNumber: string;   // CAC RC Number
    tin: string;                  // FIRS Tax Identification Number — required on all tax filings
    industry: string;
    address: string;
    phone?: string;
    email?: string;
    fiscalYearStartMonth: number; // 1-12
    logoUrl?: string;
}

export interface FiscalYearConfig {
    year: number;
    status: "active" | "closed";
    startDate: string; // ISO
    endDate: string;   // ISO
}

export interface OpeningBalance {
    // Cash & Bank
    openingCash: number;          // account 1100
    // Current Assets
    accountsReceivable: number;   // account 1200
    whtReceivable: number;        // account 1250 — WHT credits from customers
    // Equity
    shareCapital: number;         // account 3100
    retainedEarningsBF: number;   // account 3200 — closing RE of prior year (negative = accumulated loss)
    // Current Liabilities
    accountsPayable: number;      // account 2100
    // Additional migration balances — free-form COA account + amount
    customRows: Array<{ id: string; accountCode: string; amount: number }>;
}

export interface WhtScheduleRow {
    category: string;
    rate: number; // percent
}

export interface TaxConfig {
    vatRate: number; // percent (default 7.5)
    whtSchedule: WhtScheduleRow[];
    citClassification: "Small" | "Medium" | "Large" | "Auto";
    /** CA Unrecouped B/F per fiscal year — tax-only figure used in CIT computation. */
    unrecoupedCABF: Record<number, number>;
}

export interface OrgSettingsState {
    company: CompanyProfile;
    fiscalYears: FiscalYearConfig[];
    /** Per-fiscal-year opening balances. */
    openingBalances: Record<number, OpeningBalance>;
    taxConfig: TaxConfig;

    // mutators
    updateCompany: (patch: Partial<CompanyProfile>) => void;
    upsertFiscalYear: (fy: FiscalYearConfig) => void;
    closeFiscalYear: (year: number) => void;
    setOpeningBalance: (year: number, patch: Partial<OpeningBalance>) => void;
    addCustomOpeningRow: (year: number, row: { accountCode: string; amount: number }) => void;
    removeCustomOpeningRow: (year: number, id: string) => void;
    updateTaxConfig: (patch: Partial<TaxConfig>) => void;
    setUnrecoupedCABF: (year: number, value: number) => void;
}

const EMPTY_OB: OpeningBalance = {
    openingCash: 0,
    accountsReceivable: 0,
    whtReceivable: 0,
    shareCapital: 0,
    retainedEarningsBF: 0,
    accountsPayable: 0,
    customRows: [],
};

export const useOrgSettings = create<OrgSettingsState>()(
    persist(
        (set) => ({
            company: {
                name: "Acme Industries Ltd",
                companyType: "Private Limited (Ltd)",
                registrationNumber: "RC-2025-ACM",
                tin: "",
                industry: "Manufacturing",
                address: "12 Marina Road, Lagos Island, Lagos, Nigeria",
                phone: "",
                email: "",
                fiscalYearStartMonth: 1,
            },
            fiscalYears: [
                { year: 2024, status: "closed", startDate: "2024-01-01", endDate: "2024-12-31" },
                { year: 2025, status: "active", startDate: "2025-01-01", endDate: "2025-12-31" },
                { year: 2026, status: "active", startDate: "2026-01-01", endDate: "2026-12-31" },
            ],
            openingBalances: {},
            taxConfig: {
                vatRate: 7.5,
                // Rates per FIRS WHT regulations (Finance Acts inclusive).
                // Resident company rates. Non-resident rates may differ — adjust via Tax Configuration.
                whtSchedule: [
                    { category: "Dividends", rate: 10 },
                    { category: "Interest", rate: 10 },
                    { category: "Royalties", rate: 10 },
                    { category: "Rent (corporate)", rate: 10 },
                    { category: "Management fees", rate: 10 },
                    { category: "Directors' fees", rate: 10 },
                    { category: "Professional services", rate: 5 },
                    { category: "Consultancy / Technical services", rate: 5 },
                    { category: "Supply of goods", rate: 5 },
                    { category: "Construction (resident)", rate: 2.5 },
                ],
                citClassification: "Auto",
                unrecoupedCABF: {},
            },

            updateCompany: (patch) =>
                set((s) => ({ company: { ...s.company, ...patch } })),

            upsertFiscalYear: (fy) =>
                set((s) => {
                    const others = s.fiscalYears.filter((y) => y.year !== fy.year);
                    return { fiscalYears: [...others, fy].sort((a, b) => a.year - b.year) };
                }),

            closeFiscalYear: (year) =>
                set((s) => ({
                    fiscalYears: s.fiscalYears.map((y) =>
                        y.year === year ? { ...y, status: "closed" } : y,
                    ),
                })),

            setOpeningBalance: (year, patch) =>
                set((s) => ({
                    openingBalances: {
                        ...s.openingBalances,
                        [year]: { ...EMPTY_OB, ...(s.openingBalances[year] ?? {}), ...patch },
                    },
                })),

            addCustomOpeningRow: (year, row) =>
                set((s) => {
                    const cur = s.openingBalances[year] ?? EMPTY_OB;
                    return {
                        openingBalances: {
                            ...s.openingBalances,
                            [year]: {
                                ...cur,
                                customRows: [
                                    ...cur.customRows,
                                    { id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...row },
                                ],
                            },
                        },
                    };
                }),

            removeCustomOpeningRow: (year, id) =>
                set((s) => {
                    const cur = s.openingBalances[year] ?? EMPTY_OB;
                    return {
                        openingBalances: {
                            ...s.openingBalances,
                            [year]: { ...cur, customRows: cur.customRows.filter((r) => r.id !== id) },
                        },
                    };
                }),

            updateTaxConfig: (patch) =>
                set((s) => ({ taxConfig: { ...s.taxConfig, ...patch } })),

            setUnrecoupedCABF: (year, value) =>
                set((s) => ({
                    taxConfig: {
                        ...s.taxConfig,
                        unrecoupedCABF: { ...s.taxConfig.unrecoupedCABF, [year]: value },
                    },
                })),
        }),
        { name: "coreledger-org-settings" },
    ),
);

/** Selectors used by report pages. */
export function selectOpeningBalance(year: number): OpeningBalance {
    const ob = useOrgSettings.getState().openingBalances[year];
    return ob ?? EMPTY_OB;
}

export function selectUnrecoupedCABF(year: number): number {
    return useOrgSettings.getState().taxConfig.unrecoupedCABF[year] ?? 0;
}

export type DepreciationMethod = "StraightLine" | "ReducingBalance";
export type CustomerType = "Individual" | "Organization" | "NonProfit" | "Government";

export interface Vendor {
    id: string;
    name: string;
    phone: string;
    imageUrl?: string | null;
}

export interface Customer {
    id: string;
    name: string;
    type: CustomerType;
    email?: string;
    phone?: string;
    imageUrl?: string | null;
}

export interface AssetClassification {
    id: string;
    name: string;
    description: string;
    depreciationRate: number;
    annualAllowanceRate: number;
}

export interface RevenueCategory {
    id: string;
    name: string;
    description?: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    description?: string;
}

export interface Asset {
    id: string;
    description: string;
    cost: number;
    classificationId: string;
    datePurchased: string;
    vendorId: string;
    depreciationMethod: DepreciationMethod;
    coaAccountCode?: string;
    remarks?: string;
    dateCreated: string;
}

export interface DepreciationEntry {
    id: string;
    year: number;
    depreciation: number;
    cumulativeDepreciation: number;
    carryingValue: number;
}

export interface Purchase {
    id: string;
    description: string;
    invoiceNumber: string;
    cost: number;
    datePurchased: string;
    isVatApplicable: boolean;
    vatAmount: number;
    vendorId: string;
    isWhtApplicable: boolean;
    whtRate: number;
    whtAmount: number;
    coaAccountCode?: string;
    remarks?: string;
    dateCreated: string;
}

export interface Revenue {
    id: string;
    description: string;
    invoiceNumber: string;
    salesAmount: number;
    date: string;
    isTaxableSupply: boolean;
    vatAmount: number;
    whtCertificateNumber?: string;
    customerId: string;
    categoryId?: string | null;
    isWhtApplicable: boolean;
    whtRate: number;
    whtAmount: number;
    coaAccountCode?: string;
    remarks?: string;
    dateCreated: string;
}

export interface Expense {
    id: string;
    description: string;
    invoiceNumber: string;
    cost: number;
    date: string;
    isTaxDeductible: boolean;
    nonDeductibleReason?: string;
    isVatApplicable: boolean;
    vatAmount: number;
    supplierId: string;
    categoryId: string;
    isWhtApplicable: boolean;
    whtRate: number;
    whtAmount: number;
    coaAccountCode?: string;
    remarks?: string;
    dateCreated: string;
}

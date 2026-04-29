export type AssetClassification =
  | "Office Furniture"
  | "Computer Equipment"
  | "Motor Vehicles"
  | "Plant & Machinery"
  | "Office Equipment"
  | "Building";

export interface AssetItem {
  id: string;
  dateCreated: string; // ISO
  description: string;
  cost: number;
  datePurchased: string; // ISO
  classification: AssetClassification;
  remarks?: string;
}

export interface PurchaseItem {
  id: string;
  date: string;
  invoiceNo: string;
  description: string;
  vendor: string;
  cost: number;
  vat: boolean;
  whtPct?: number; // null/0 means no
}

export interface RevenueItem {
  id: string;
  date: string;
  invoiceNo: string;
  description: string;
  customer: string;
  category: string;
  sales: number;
  vat: boolean;
}

export interface ExpenseItem {
  id: string;
  date: string;
  invoiceNo: string;
  description: string;
  supplier: string;
  category: string;
  cost: number;
  deductible: boolean;
}

import { useEffect, useState } from "react";
import type {
    Asset, AssetClassification, Customer, DepreciationEntry, Expense, ExpenseCategory,
    Purchase, Revenue, RevenueCategory, Vendor,
} from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);
const today = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString();
};

const VAT_RATE = 0.075;

function rng(seed: number) {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}
function pick<T>(arr: T[], r: number): T { return arr[Math.floor(r * arr.length)]; }

export const vendors: Vendor[] = [
    { id: "v1", name: "TechHub Nigeria Ltd", phone: "+234 803 555 0101" },
    { id: "v2", name: "Lagos Office Supplies", phone: "+234 802 555 0202" },
    { id: "v3", name: "Apex Furniture Co.", phone: "+234 805 555 0303" },
    { id: "v4", name: "PowerGen Generators", phone: "+234 809 555 0404" },
    { id: "v5", name: "BlueMoon Logistics", phone: "+234 807 555 0505" },
    { id: "v6", name: "Sahara Catering Services", phone: "+234 806 555 0606" },
    { id: "v7", name: "Northern Steel Works", phone: "+234 803 555 0707" },
    { id: "v8", name: "Zenith Print Media", phone: "+234 802 555 0808" },
    { id: "v9", name: "Crystal Cleaning Co.", phone: "+234 805 555 0909" },
    { id: "v10", name: "Atlas Security Services", phone: "+234 809 555 1010" },
    { id: "v11", name: "GreenLeaf Stationery", phone: "+234 807 555 1111" },
    { id: "v12", name: "Pinnacle IT Solutions", phone: "+234 806 555 1212" },
];

export const customers: Customer[] = [
    { id: "c1", name: "Adaeze Okoro", type: "Individual", email: "adaeze@example.com", phone: "+234 803 111 2222" },
    { id: "c2", name: "Sterling Bank Plc", type: "Organization", email: "ap@sterling.ng", phone: "+234 1 277 0000" },
    { id: "c3", name: "Hope Foundation NG", type: "NonProfit", email: "info@hopefoundation.ng", phone: "+234 802 333 4444" },
    { id: "c4", name: "Federal Ministry of Works", type: "Government", email: "procurement@fmw.gov.ng", phone: "+234 9 234 5555" },
    { id: "c5", name: "Chinedu Eze", type: "Individual", email: "chinedu@example.com", phone: "+234 805 666 7777" },
    { id: "c6", name: "Andela Inc.", type: "Organization", email: "billing@andela.com", phone: "+234 1 270 8888" },
    { id: "c7", name: "Folake Adeyemi", type: "Individual", email: "folake@example.com", phone: "+234 803 999 0001" },
    { id: "c8", name: "First City Monument Bank", type: "Organization", email: "ap@fcmb.com", phone: "+234 1 270 0001" },
    { id: "c9", name: "Lagos State Govt", type: "Government", email: "tenders@lagosstate.gov.ng", phone: "+234 1 234 0002" },
    { id: "c10", name: "BrightFuture NGO", type: "NonProfit", email: "info@brightfuture.org", phone: "+234 802 444 0003" },
    { id: "c11", name: "Kunle Bakare", type: "Individual", email: "kunle@example.com", phone: "+234 805 555 0004" },
    { id: "c12", name: "MTN Nigeria Plc", type: "Organization", email: "vendors@mtn.com", phone: "+234 1 271 0005" },
    { id: "c13", name: "Dangote Cement Plc", type: "Organization", email: "procurement@dangote.com", phone: "+234 1 280 0006" },
    { id: "c14", name: "Aisha Mohammed", type: "Individual", email: "aisha@example.com", phone: "+234 803 222 0007" },
];

export const classifications: AssetClassification[] = [
    { id: "cls1", name: "Computer Equipment", description: "Laptops, desktops, peripherals", depreciationRate: 25, annualAllowanceRate: 50 },
    { id: "cls2", name: "Office Furniture", description: "Desks, chairs, cabinets", depreciationRate: 10, annualAllowanceRate: 25 },
    { id: "cls3", name: "Motor Vehicles", description: "Cars, trucks, vans", depreciationRate: 20, annualAllowanceRate: 50 },
    { id: "cls4", name: "Plant & Machinery", description: "Industrial equipment", depreciationRate: 15, annualAllowanceRate: 50 },
    { id: "cls5", name: "Buildings", description: "Office and warehouse buildings", depreciationRate: 4, annualAllowanceRate: 15 },
    { id: "cls6", name: "Office Equipment", description: "Printers, copiers, scanners", depreciationRate: 20, annualAllowanceRate: 50 },
];

export const revenueCategories: RevenueCategory[] = [
    { id: "rc1", name: "Consulting Services" },
    { id: "rc2", name: "Product Sales" },
    { id: "rc3", name: "Subscription Revenue" },
    { id: "rc4", name: "Training & Workshops" },
    { id: "rc5", name: "Maintenance Contracts" },
    { id: "rc6", name: "Other Income" },
];

export const expenseCategories: ExpenseCategory[] = [
    { id: "ec1", name: "Rent & Utilities" },
    { id: "ec2", name: "Salaries & Wages" },
    { id: "ec3", name: "Office Supplies" },
    { id: "ec4", name: "Travel & Transport" },
    { id: "ec5", name: "Marketing" },
    { id: "ec6", name: "Professional Fees" },
    { id: "ec7", name: "Repairs & Maintenance" },
];

const assetDescriptors = [
    "HP LaserJet Pro Printer", "Dell Latitude 7440 Laptop", "Executive Office Chair", "20 KVA Diesel Generator",
    "Toyota Hilux 2022", "Apple MacBook Pro 16\"", "Cisco Catalyst Switch 48-port", "Conference Table — Walnut",
    "Samsung 65\" Display Panel", "Honda CR-V 2023", "Industrial Air Conditioner", "Reception Sofa Set",
    "Brother Multi-Function Copier", "Steel Filing Cabinet", "ThinkPad X1 Carbon Gen 11", "Whiteboard 2400x1200",
    "Boardroom Projector 4K", "Server Rack 42U", "UPS APC 5KVA", "Toyota Hiace Bus 2021",
    "Office Microwave Oven", "Coffee Machine — Commercial", "Pantry Refrigerator 250L", "Document Shredder Heavy-Duty",
    "Standing Desk Adjustable", "Ergonomic Mesh Chair", "Network Firewall Appliance", "iPad Pro 12.9\"",
    "Polycom Conference Phone", "Surveillance Camera Kit (8ch)", "Generator Sound-Proof Canopy", "Forklift Toyota 3-ton",
    "Mitsubishi Pajero 2020", "Office Building — Annex", "CNC Milling Machine", "Industrial Welding Plant",
    "Bookshelf Mahogany", "Visitor Lounge Chairs (set of 4)", "iMac 27\" 5K", "Logitech Wireless Headset (10x)",
    "Heavy-Duty Power Inverter", "Reception Desk Custom", "Kyocera Color Photocopier", "Office Partition Glass",
];
const purchaseDescriptors = [
    "Office Supplies Restock", "Server Rack Equipment", "Catering — Staff Retreat", "Office Furniture Bulk Order",
    "Software Licensing Renewal", "Cleaning Supplies Quarterly", "Bottled Water Subscription", "Stationery Bulk Purchase",
    "Toner Cartridges Restock", "Printing — Brochures Run", "Promotional Banners Batch", "Event Decorations",
    "Networking Cables CAT-6", "USB-C Hubs (bulk)", "Whiteboard Markers Crate", "Coffee & Tea Supplies",
    "Branded Polo Shirts (50)", "Conference Lanyards", "Snack Pack Restock", "Diesel Drum 200L",
    "Lubricants & Engine Oil", "Tires — Hilux Set", "Office Plants Restock", "Air Freshener Refills",
    "Spare Generator Battery", "Phone Accessories", "External SSD 2TB (5x)", "HDMI Adapters Pack",
    "Window Blinds Custom", "Carpet Tiles Replacement", "Wall Paint — Office Refresh", "Light Bulbs LED Bulk",
    "First Aid Supplies", "Pantry Crockery Set", "Christmas Hampers", "Workshop Kit Replenishment",
    "Outdoor Signage Vinyl", "Reception Magazines Sub.", "Subscription — News Outlet", "Catering — Town Hall",
];
const revenueDescriptors = [
    "Consulting Services — Monthly", "Annual Subscription — Enterprise", "Training Workshop", "Government Project Phase",
    "Donation Acknowledged", "Implementation Services", "License Renewal", "Maintenance Contract Q1",
    "Strategy Workshop Delivery", "Custom Development Sprint", "Audit & Compliance Review", "Migration Project",
    "Premium Support Add-on", "Onsite Training Session", "Quarterly Retainer", "Software Sale — Modules",
    "Hardware Resale", "Cloud Hosting Resale", "Data Migration Engagement", "Speaking Engagement Fee",
    "Subscription Upgrade", "Setup & Onboarding Fee", "API Usage — Tier 2", "Integration Services",
    "White-Label Deployment", "Reseller Partnership Fee", "Annual Contract Renewal", "Performance Bonus Earned",
    "Royalty Payment Received", "Interest Income (Treasury)", "Rental Income — Sub-let", "Refund of Overpayment",
    "Project Closeout Final Bill", "Recovery — Bad Debt", "Retainer Top-up", "Express Delivery Surcharge",
    "Custom Report Generation", "Compliance Filing Service", "Year-End Advisory", "New Customer Onboarding",
];
const expenseDescriptors = [
    "Monthly Office Rent", "Diesel & Generator Maintenance", "Client Entertainment", "Marketing Retainer",
    "Internet Bandwidth — Monthly", "Mobile Airtime Bulk", "Electricity Bill", "Water Bill",
    "Cleaning Service Monthly", "Security Service Monthly", "Office Cleaning Materials", "Bank Charges",
    "Audit Fees", "Legal Retainer", "Travel — Abuja Trip", "Hotel Accommodation",
    "Conference Registration", "Staff Welfare", "Health Insurance Premium", "Pension Remittance",
    "PAYE Remittance", "VAT Remittance", "Software Subscriptions", "Office Repairs",
    "Vehicle Maintenance", "Generator Service", "Printing Charges", "Courier Charges",
    "Newspaper & Periodicals", "Tea & Refreshments", "Training & Development", "Recruitment Expenses",
    "Bonus & Incentives", "Repairs — Air Conditioner", "Office Insurance Premium", "Vehicle Insurance Premium",
    "Marketing — Social Media", "Marketing — Billboards", "Promotional Items", "Donations & CSR",
];

function buildAssets(): Asset[] {
    const r = rng(101);
    const list: Asset[] = [];
    for (let i = 0; i < assetDescriptors.length; i++) {
        const cls = pick(classifications, r());
        const v = pick(vendors, r());
        const cost = Math.round((50 + r() * 9950) * 1000);
        const offset = -Math.floor(r() * 700) - 5;
        list.push({ id: uid(), description: assetDescriptors[i], cost, classificationId: cls.id, datePurchased: today(offset), vendorId: v.id, depreciationMethod: r() > 0.5 ? "StraightLine" : "ReducingBalance", remarks: r() > 0.7 ? "Capitalized this period" : "", dateCreated: today(offset) });
    }
    return list.sort((a, b) => +new Date(b.dateCreated) - +new Date(a.dateCreated));
}

function buildPurchases(): Purchase[] {
    const r = rng(202);
    const list: Purchase[] = [];
    for (let i = 0; i < purchaseDescriptors.length; i++) {
        const v = pick(vendors, r());
        const cost = Math.round((20 + r() * 4980) * 1000);
        const isVat = r() > 0.25;
        const isWht = r() > 0.55;
        const whtRate = isWht ? pick([5, 10], r()) : 0;
        const offset = -Math.floor(r() * 200) - 1;
        list.push({ id: uid(), description: purchaseDescriptors[i], invoiceNumber: `INV-2025-${String(40 + i).padStart(4, "0")}`, cost, datePurchased: today(offset), isVatApplicable: isVat, vatAmount: isVat ? cost * VAT_RATE : 0, vendorId: v.id, isWhtApplicable: isWht, whtRate, whtAmount: isWht ? cost * (whtRate / 100) : 0, remarks: r() > 0.8 ? "Bulk discount applied" : "", dateCreated: today(offset) });
    }
    return list.sort((a, b) => +new Date(b.dateCreated) - +new Date(a.dateCreated));
}

function buildRevenues(): Revenue[] {
    const r = rng(303);
    const list: Revenue[] = [];
    for (let i = 0; i < revenueDescriptors.length; i++) {
        const c = pick(customers, r());
        const cat = pick(revenueCategories, r());
        const sales = Math.round((100 + r() * 19900) * 1000);
        const isTax = r() > 0.15;
        const isWht = r() > 0.55;
        const whtRate = isWht ? pick([5, 10], r()) : 0;
        const offset = -Math.floor(r() * 180) - 1;
        list.push({ id: uid(), description: revenueDescriptors[i], invoiceNumber: `INV-OUT-2025-${String(10 + i).padStart(4, "0")}`, salesAmount: sales, date: today(offset), isTaxableSupply: isTax, vatAmount: isTax ? sales * VAT_RATE : 0, customerId: c.id, categoryId: cat.id, isWhtApplicable: isWht, whtRate, whtAmount: isWht ? sales * (whtRate / 100) : 0, whtCertificateNumber: isWht ? `WHT-2025-${String(30 + i).padStart(4, "0")}` : undefined, remarks: "", dateCreated: today(offset) });
    }
    return list.sort((a, b) => +new Date(b.dateCreated) - +new Date(a.dateCreated));
}

function buildExpenses(): Expense[] {
    const r = rng(404);
    const list: Expense[] = [];
    for (let i = 0; i < expenseDescriptors.length; i++) {
        const v = pick(vendors, r());
        const cat = pick(expenseCategories, r());
        const cost = Math.round((10 + r() * 2990) * 1000);
        const isVat = r() > 0.4;
        const isWht = r() > 0.55;
        const whtRate = isWht ? pick([5, 10], r()) : 0;
        const isDed = r() > 0.12;
        const offset = -Math.floor(r() * 180) - 1;
        list.push({ id: uid(), description: expenseDescriptors[i], invoiceNumber: `INV-EXP-${String(80 + i).padStart(4, "0")}`, cost, date: today(offset), isTaxDeductible: isDed, nonDeductibleReason: !isDed ? "Personal/non-business expense" : undefined, isVatApplicable: isVat, vatAmount: isVat ? cost * VAT_RATE : 0, supplierId: v.id, categoryId: cat.id, isWhtApplicable: isWht, whtRate, whtAmount: isWht ? cost * (whtRate / 100) : 0, remarks: "", dateCreated: today(offset) });
    }
    return list.sort((a, b) => +new Date(b.dateCreated) - +new Date(a.dateCreated));
}

export let assets: Asset[] = buildAssets();
export let purchases: Purchase[] = buildPurchases();
export let revenues: Revenue[] = buildRevenues();
export let expenses: Expense[] = buildExpenses();

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

function useSubscribed<T>(getter: () => T): T {
    const [value, setValue] = useState(getter);
    useEffect(() => subscribe(() => setValue(getter())), []); // eslint-disable-line react-hooks/exhaustive-deps
    return value;
}

function delay(ms = 350) { return new Promise<void>((r) => setTimeout(r, ms)); }

export const api = {
    async listAssets(search: string, page: number, pageSize = 10) {
        await delay();
        const filtered = assets.filter((a) => !search || a.description.toLowerCase().includes(search.toLowerCase()));
        const total = filtered.length;
        const items = filtered.slice((page - 1) * pageSize, page * pageSize);
        return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
    },
    async getAsset(id: string) { await delay(); const a = assets.find((x) => x.id === id); if (!a) throw new Error("Asset not found"); return a; },
    async getDepreciation(asset: Asset): Promise<DepreciationEntry[]> {
        await delay(250);
        const cls = classifications.find((c) => c.id === asset.classificationId);
        if (!cls) return [];
        const rate = cls.depreciationRate / 100;
        const entries: DepreciationEntry[] = [];
        let carrying = asset.cost;
        let cumulative = 0;
        const startYear = new Date(asset.datePurchased).getFullYear();
        const totalYears = asset.depreciationMethod === "StraightLine" ? Math.ceil(1 / rate) : 8;
        for (let i = 0; i < totalYears; i++) {
            const dep = asset.depreciationMethod === "StraightLine" ? asset.cost * rate : carrying * rate;
            const depr = Math.min(dep, carrying);
            cumulative += depr;
            carrying = Math.max(0, carrying - depr);
            entries.push({ id: `${asset.id}-${i}`, year: startYear + i, depreciation: depr, cumulativeDepreciation: cumulative, carryingValue: carrying });
            if (carrying <= 0.5) break;
        }
        return entries;
    },
    async createAsset(input: Omit<Asset, "id" | "dateCreated">) { await delay(500); const a: Asset = { ...input, id: uid(), dateCreated: new Date().toISOString() }; assets = [a, ...assets]; notify(); return a; },
    async updateAsset(id: string, patch: Partial<Asset>) { await delay(500); assets = assets.map((a) => (a.id === id ? { ...a, ...patch } : a)); notify(); return assets.find((a) => a.id === id)!; },
    async deleteAsset(id: string) { await delay(400); assets = assets.filter((a) => a.id !== id); notify(); },

    async listPurchases(search: string, page: number, pageSize = 10) { await delay(); const f = purchases.filter((p) => !search || p.description.toLowerCase().includes(search.toLowerCase()) || p.invoiceNumber.toLowerCase().includes(search.toLowerCase())); return { items: f.slice((page - 1) * pageSize, page * pageSize), total: f.length, page, pageSize, totalPages: Math.max(1, Math.ceil(f.length / pageSize)) }; },
    async getPurchase(id: string) { await delay(); const p = purchases.find((x) => x.id === id); if (!p) throw new Error("Purchase not found"); return p; },
    async createPurchase(input: Omit<Purchase, "id" | "dateCreated" | "vatAmount" | "whtAmount">) { await delay(500); const vatAmount = input.isVatApplicable ? input.cost * VAT_RATE : 0; const whtAmount = input.isWhtApplicable ? input.cost * (input.whtRate / 100) : 0; const p: Purchase = { ...input, vatAmount, whtAmount, id: uid(), dateCreated: new Date().toISOString() }; purchases = [p, ...purchases]; notify(); return p; },
    async updatePurchase(id: string, patch: Partial<Purchase>) { await delay(500); purchases = purchases.map((p) => { if (p.id !== id) return p; const merged = { ...p, ...patch }; merged.vatAmount = merged.isVatApplicable ? merged.cost * VAT_RATE : 0; merged.whtAmount = merged.isWhtApplicable ? merged.cost * (merged.whtRate / 100) : 0; return merged; }); notify(); return purchases.find((p) => p.id === id)!; },
    async deletePurchase(id: string) { await delay(400); purchases = purchases.filter((p) => p.id !== id); notify(); },

    async listRevenues(search: string, page: number, pageSize = 10) { await delay(); const f = revenues.filter((r) => !search || r.description.toLowerCase().includes(search.toLowerCase()) || r.invoiceNumber.toLowerCase().includes(search.toLowerCase())); return { items: f.slice((page - 1) * pageSize, page * pageSize), total: f.length, page, pageSize, totalPages: Math.max(1, Math.ceil(f.length / pageSize)) }; },
    async getRevenue(id: string) { await delay(); const r = revenues.find((x) => x.id === id); if (!r) throw new Error("Revenue not found"); return r; },
    async createRevenue(input: Omit<Revenue, "id" | "dateCreated" | "vatAmount" | "whtAmount">) { await delay(500); const vatAmount = input.isTaxableSupply ? input.salesAmount * VAT_RATE : 0; const whtAmount = input.isWhtApplicable ? input.salesAmount * (input.whtRate / 100) : 0; const r: Revenue = { ...input, vatAmount, whtAmount, id: uid(), dateCreated: new Date().toISOString() }; revenues = [r, ...revenues]; notify(); return r; },
    async updateRevenue(id: string, patch: Partial<Revenue>) { await delay(500); revenues = revenues.map((r) => { if (r.id !== id) return r; const merged = { ...r, ...patch }; merged.vatAmount = merged.isTaxableSupply ? merged.salesAmount * VAT_RATE : 0; merged.whtAmount = merged.isWhtApplicable ? merged.salesAmount * (merged.whtRate / 100) : 0; return merged; }); notify(); return revenues.find((r) => r.id === id)!; },
    async deleteRevenue(id: string) { await delay(400); revenues = revenues.filter((r) => r.id !== id); notify(); },

    async listExpenses(search: string, page: number, pageSize = 10) { await delay(); const f = expenses.filter((e) => !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.invoiceNumber.toLowerCase().includes(search.toLowerCase())); return { items: f.slice((page - 1) * pageSize, page * pageSize), total: f.length, page, pageSize, totalPages: Math.max(1, Math.ceil(f.length / pageSize)) }; },
    async getExpense(id: string) { await delay(); const e = expenses.find((x) => x.id === id); if (!e) throw new Error("Expense not found"); return e; },
    async createExpense(input: Omit<Expense, "id" | "dateCreated" | "vatAmount" | "whtAmount">) { await delay(500); const vatAmount = input.isVatApplicable ? input.cost * VAT_RATE : 0; const whtAmount = input.isWhtApplicable ? input.cost * (input.whtRate / 100) : 0; const e: Expense = { ...input, vatAmount, whtAmount, id: uid(), dateCreated: new Date().toISOString() }; expenses = [e, ...expenses]; notify(); return e; },
    async updateExpense(id: string, patch: Partial<Expense>) { await delay(500); expenses = expenses.map((e) => { if (e.id !== id) return e; const merged = { ...e, ...patch }; merged.vatAmount = merged.isVatApplicable ? merged.cost * VAT_RATE : 0; merged.whtAmount = merged.isWhtApplicable ? merged.cost * (merged.whtRate / 100) : 0; return merged; }); notify(); return expenses.find((e) => e.id === id)!; },
    async deleteExpense(id: string) { await delay(400); expenses = expenses.filter((e) => e.id !== id); notify(); },

    async listVendors(search: string) { await delay(250); return vendors.filter((v) => !search || v.name.toLowerCase().includes(search.toLowerCase())); },
    async listCustomers(search: string) { await delay(250); return customers.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase())); },
    async listClassifications() { await delay(200); return classifications; },
    async listRevenueCategories() { await delay(200); return revenueCategories; },
    async listExpenseCategories() { await delay(200); return expenseCategories; },
};

export function useStoreVersion() {
    return useSubscribed(() => assets.length + purchases.length + revenues.length + expenses.length);
}

export function getVendor(id: string) { return vendors.find((v) => v.id === id); }
export function getCustomer(id: string) { return customers.find((c) => c.id === id); }
export function getClassification(id: string) { return classifications.find((c) => c.id === id); }
export function getRevenueCategory(id?: string | null) { return id ? revenueCategories.find((c) => c.id === id) : undefined; }
export function getExpenseCategory(id: string) { return expenseCategories.find((c) => c.id === id); }

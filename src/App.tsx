import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/ca/Overview";
import Schedule from "./pages/ca/Schedule";
import Classifications from "./pages/ca/Classifications";
import History from "./pages/ca/History";
import TaxComputation from "./pages/TaxComputation";
import Placeholder from "./pages/Placeholder";
import PayrollRuns from "./pages/paye/PayrollRuns";
import PayrollRunDetail from "./pages/paye/PayrollRunDetail";
import PayeEmployees from "./pages/paye/Employees";
import PayeRemittance from "./pages/paye/Remittance";
import PayeTaxBands from "./pages/paye/TaxBands";
import PayePortal from "./pages/paye/Portal";
import VendorsPage from "./pages/contacts/Vendors";
import VendorDetailPage from "./pages/contacts/VendorDetail";
import CustomersPage from "./pages/contacts/Customers";
import CustomerDetailPage from "./pages/contacts/CustomerDetail";
import EmployeesPage from "./pages/contacts/Employees";
import EmployeeDetailPage from "./pages/contacts/EmployeeDetail";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Contacts */}
            <Route path="/contacts/vendors" element={<VendorsPage />} />
            <Route path="/contacts/vendors/:id" element={<VendorDetailPage />} />
            <Route path="/contacts/customers" element={<CustomersPage />} />
            <Route path="/contacts/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/contacts/employees" element={<EmployeesPage />} />
            <Route path="/contacts/employees/:id" element={<EmployeeDetailPage />} />

            {/* Reports */}
            <Route path="/reports/profit-and-loss" element={<Placeholder title="Profit and Loss" breadcrumbs={["Reports", "Profit and Loss"]} />} />
            <Route path="/reports/balance-sheet" element={<Placeholder title="Balance Sheet" breadcrumbs={["Reports", "Balance Sheet"]} />} />
            <Route path="/reports/cash-flow" element={<Placeholder title="Cash Flow" breadcrumbs={["Reports", "Cash Flow"]} />} />
            <Route path="/reports/trial-balance" element={<Placeholder title="Trial Balance" breadcrumbs={["Reports", "Trial Balance"]} />} />

            {/* Books */}
            <Route path="/books/charts-of-accounts" element={<Placeholder title="Charts of Accounts" breadcrumbs={["Books", "Charts of Accounts"]} />} />
            <Route path="/books/journals" element={<Placeholder title="Journals" breadcrumbs={["Books", "Journals"]} />} />

            <Route path="/transactions/revenue" element={<Placeholder title="Revenue" breadcrumbs={["Transactions", "Revenue"]} />} />
            <Route path="/transactions/purchases" element={<Placeholder title="Purchases" breadcrumbs={["Transactions", "Purchases"]} />} />
            <Route path="/transactions/expenses" element={<Placeholder title="Expenses" breadcrumbs={["Transactions", "Expenses"]} />} />
            <Route path="/transactions/assets" element={<Placeholder title="Assets" breadcrumbs={["Transactions", "Assets"]} />} />
            <Route path="/assets/register" element={<Placeholder title="Asset Register" breadcrumbs={["Assets", "Asset Register"]} />} />
            <Route path="/assets/classifications" element={<Classifications />} />
            <Route path="/taxation/capital-allowance" element={<Overview />} />
            <Route path="/taxation/capital-allowance/schedule" element={<Schedule />} />
            <Route path="/taxation/capital-allowance/classifications" element={<Classifications />} />
            <Route path="/taxation/capital-allowance/history" element={<History />} />
            <Route path="/taxation/tax-computation" element={<TaxComputation />} />
            <Route path="/taxation/paye" element={<PayrollRuns />} />
            <Route path="/taxation/paye/runs/:runKey" element={<PayrollRunDetail />} />
            <Route path="/taxation/paye/employees" element={<PayeEmployees />} />
            <Route path="/taxation/paye/remittance" element={<PayeRemittance />} />
            <Route path="/taxation/paye/portal" element={<PayePortal />} />
            <Route path="/taxation/paye/bands" element={<PayeTaxBands />} />
            <Route path="/taxation/vat" element={<Placeholder title="VAT" breadcrumbs={["Taxation", "VAT"]} />} />
            <Route path="/taxation/wht" element={<Placeholder title="WHT" breadcrumbs={["Taxation", "WHT"]} />} />
            <Route path="/reports" element={<Placeholder title="Reports" breadcrumbs={["Reports"]} />} />
            <Route path="/settings" element={<Placeholder title="Settings" breadcrumbs={["Settings"]} />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

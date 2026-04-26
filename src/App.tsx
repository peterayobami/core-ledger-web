import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import { FYProvider } from "@/context/fiscal-year";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FYProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions/revenue" element={<Placeholder title="Revenue" breadcrumbs={["Transactions", "Revenue"]} />} />
            <Route path="/transactions/purchases" element={<Placeholder title="Purchases" breadcrumbs={["Transactions", "Purchases"]} />} />
            <Route path="/transactions/expenses" element={<Placeholder title="Expenses" breadcrumbs={["Transactions", "Expenses"]} />} />
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
            <Route path="/taxation/paye/bands" element={<PayeTaxBands />} />
            <Route path="/taxation/vat" element={<Placeholder title="VAT" breadcrumbs={["Taxation", "VAT"]} />} />
            <Route path="/taxation/wht" element={<Placeholder title="WHT" breadcrumbs={["Taxation", "WHT"]} />} />
            <Route path="/reports" element={<Placeholder title="Reports" breadcrumbs={["Reports"]} />} />
            <Route path="/settings" element={<Placeholder title="Settings" breadcrumbs={["Settings"]} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FYProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

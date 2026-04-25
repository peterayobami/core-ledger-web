import { createContext, useContext, useState, ReactNode } from "react";
import { CURRENT_FY } from "@/lib/ca-data";

type FYContext = {
  fiscalYear: number;
  setFiscalYear: (y: number) => void;
};

const Ctx = createContext<FYContext>({ fiscalYear: CURRENT_FY, setFiscalYear: () => {} });

export const FYProvider = ({ children }: { children: ReactNode }) => {
  const [fiscalYear, setFiscalYear] = useState(CURRENT_FY);
  return <Ctx.Provider value={{ fiscalYear, setFiscalYear }}>{children}</Ctx.Provider>;
};

export const useFY = () => useContext(Ctx);

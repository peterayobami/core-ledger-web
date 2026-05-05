import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payeRepository } from "@/lib/repositories/paye.repository";
import { employeeRepository } from "@/lib/repositories/employee.repository";
import type { PayeProfile } from "@/lib/models/paye";

export const payeEmployeeKeys = {
    all: ["paye-employees"] as const,
    detail: (id: string) => ["paye-employees", id] as const,
};

export const usePayeEmployees = () =>
    useQuery({ queryKey: payeEmployeeKeys.all, queryFn: payeRepository.getEmployees });

export const usePayeEmployee = (id: string) =>
    useQuery({
        queryKey: payeEmployeeKeys.detail(id),
        queryFn: () => payeRepository.getEmployeeById(id),
        enabled: !!id,
    });

export const useSavePayeProfile = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, profile }: { id: string; profile: PayeProfile }) =>
            Promise.resolve(employeeRepository.savePayeProfile(id, profile)),
        onSuccess: (_, { id }) => {
            // Invalidate both PAYE and HR employee caches so all pages stay in sync
            qc.invalidateQueries({ queryKey: payeEmployeeKeys.all });
            qc.invalidateQueries({ queryKey: payeEmployeeKeys.detail(id) });
            qc.invalidateQueries({ queryKey: ["hr-employees"] });
            qc.invalidateQueries({ queryKey: ["hr-employees", id] });
        },
    });
};

/** @deprecated use usePayeEmployees */
export const useEmployees = usePayeEmployees;

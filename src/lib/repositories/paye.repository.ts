import { RUNS, CURRENT_PERIOD, blankPayeProfile } from "@/lib/mock-data/paye";
import { employeeRepository } from "@/lib/repositories/employee.repository";
import { fullName } from "@/lib/models/employee";
import type { Employee, PayrollRun, Period } from "@/lib/models/paye";

function hrToPayeEmployee(hr: ReturnType<typeof employeeRepository.getById>): Employee | undefined {
    if (!hr) return undefined;
    return {
        id: hr.id,
        name: fullName(hr),
        department: hr.department,
        email: hr.email,
        profile: hr.payeProfile ?? blankPayeProfile(),
    };
}

export const payeRepository = {
    getEmployees: (): Employee[] =>
        employeeRepository.list().map(hr => hrToPayeEmployee(hr)!),
    getEmployeeById: (id: string): Employee | undefined =>
        hrToPayeEmployee(employeeRepository.getById(id)),
    getRuns: (): PayrollRun[] => RUNS,
    getRunByPeriod: (p: Period): PayrollRun | undefined =>
        RUNS.find(r => r.period.year === p.year && r.period.month === p.month),
    getCurrentPeriod: (): Period => CURRENT_PERIOD,
};

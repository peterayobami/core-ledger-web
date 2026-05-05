import type { HrEmployee } from "@/lib/models/employee";
import type { PayeProfile } from "@/lib/models/paye";

const profile = (
    basic: number, housing: number, transport: number, other: number,
    rent: number, rentApproved: boolean, lifeIns = 0, tin: string | null = null,
    state = "Lagos",
): PayeProfile => ({
    basic, housing, transport, other,
    rentPaid: rent, rentReliefApproved: rentApproved, lifeInsurance: lifeIns,
    nhisOptIn: false, nhisAmount: 0,
    residency: "Resident", state, tin, hasProfile: true,
});

export const HR_EMPLOYEES: HrEmployee[] = [
    {
        id: "EMP-001", firstName: "Aisha", lastName: "Nwosu", department: "Marketing",
        title: "Marketing Manager", email: "a.nwosu@company.com", phone: "+234 706 678 9012",
        payeProfile: profile(4_200_000, 2_100_000, 1_050_000, 500_000, 1_500_000, true, 80_000, "7890123456"),
    },
    {
        id: "EMP-002", firstName: "Priya", lastName: "Sharma", department: "Sales",
        title: "Account Executive", email: "p.sharma@company.com", phone: "+234 809 876 5432",
        payeProfile: profile(3_600_000, 1_800_000, 900_000, 400_000, 1_200_000, true, 0, "3456789012", "FCT Abuja"),
    },
    {
        id: "EMP-003", firstName: "Marcus", lastName: "Webb", department: "Finance",
        title: "Financial Analyst", email: "m.webb@company.com", phone: "+234 812 345 6789",
        payeProfile: profile(4_800_000, 2_400_000, 1_200_000, 600_000, 1_800_000, true, 120_000, "1234567890"),
    },
    {
        id: "EMP-004", firstName: "Sofia", lastName: "Reyes", department: "Human Resources",
        title: "HR Lead", email: "s.reyes@company.com", phone: "+234 806 456 7890",
        payeProfile: profile(3_000_000, 1_500_000, 750_000, 250_000, 900_000, false, 0, "5678901234"),
    },
    {
        id: "EMP-005", firstName: "James", lastName: "Thornton", department: "Operations",
        title: "Operations Manager", email: "j.thornton@company.com", phone: "+234 803 567 8901",
        payeProfile: profile(9_600_000, 4_800_000, 2_400_000, 2_000_000, 3_600_000, true, 250_000, "6789012345"),
    },
    {
        id: "EMP-006", firstName: "Liam", lastName: "Fitzgerald", department: "Engineering",
        title: "Senior Engineer", email: "l.fitzgerald@company.com", phone: "+234 814 789 0123",
        payeProfile: profile(7_200_000, 3_600_000, 1_800_000, 1_200_000, 2_400_000, true, 200_000, "2345678901"),
    },
    {
        id: "EMP-007", firstName: "Nina", lastName: "Okafor", department: "Sales",
        title: "Sales Executive", email: "n.okafor@company.com", phone: "+234 805 890 1234",
        payeProfile: profile(2_700_000, 1_350_000, 675_000, 200_000, 800_000, true, 0, "1122334455"),
    },
    {
        id: "EMP-008", firstName: "Daniel", lastName: "Park", department: "Finance",
        title: "Finance Associate", email: "d.park@company.com", phone: "+234 811 901 2345",
        payeProfile: profile(2_400_000, 1_200_000, 600_000, 150_000, 0, false, 0, null, "Rivers"),
    },
    {
        id: "EMP-009", firstName: "Maryam", lastName: "Bello", department: "Operations",
        title: "Operations Analyst", email: "m.bello@company.com", phone: "+234 807 012 3456",
        // No PAYE profile yet — needs setup
        payeProfile: undefined,
    },
];

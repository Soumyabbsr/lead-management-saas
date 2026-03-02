import { AREAS } from './mockData';

export interface Employee {
    id: string;
    name: string;
    role: 'admin' | 'sales' | 'field_agent' | 'manager';
    assignedAreas: string[];
    avatar: string;
    plan: string;
    phone?: string;
    email?: string;
    password?: string;
    monthlyTarget?: number;
    status: 'Active' | 'Inactive';
}

export const EMPLOYEES: Employee[] = [
    {
        id: 'E000',
        name: 'Soumya Admin',
        role: 'admin',
        assignedAreas: [],
        avatar: 'SA',
        plan: 'Enterprise',
        phone: '9876500000',
        email: 'admin@pgcrm.com',
        monthlyTarget: 0,
        status: 'Active',
    },
    {
        id: 'E001',
        name: 'Riya Sharma',
        role: 'sales',
        assignedAreas: ['Koramangala', 'Indiranagar', 'HSR Layout'],
        avatar: 'RS',
        plan: 'Startup',
        phone: '9876501001',
        email: 'riya@pgcrm.com',
        monthlyTarget: 8,
        status: 'Active',
    },
    {
        id: 'E002',
        name: 'Amit Joshi',
        role: 'sales',
        assignedAreas: ['Whitefield', 'Marathahalli', 'Electronic City'],
        avatar: 'AJ',
        plan: 'Startup',
        phone: '9876501002',
        email: 'amit@pgcrm.com',
        monthlyTarget: 8,
        status: 'Active',
    },
    {
        id: 'E003',
        name: 'Karan Singh',
        role: 'sales',
        assignedAreas: ['BTM Layout', 'Sarjapur', 'Jayanagar'],
        avatar: 'KS',
        plan: 'Startup',
        phone: '9876501003',
        email: 'karan@pgcrm.com',
        monthlyTarget: 8,
        status: 'Active',
    },
    {
        id: 'E004',
        name: 'Rakesh Dada',
        role: 'field_agent',
        assignedAreas: ['Koramangala', 'BTM Layout', 'Sarjapur'],
        avatar: 'RD',
        plan: 'Startup',
        phone: '9876501004',
        email: 'rakesh@pgcrm.com',
        monthlyTarget: 0,
        status: 'Active',
    },
    {
        id: 'E005',
        name: 'Suresh Kumar',
        role: 'field_agent',
        assignedAreas: ['Whitefield', 'Marathahalli', 'HSR Layout'],
        avatar: 'SK',
        plan: 'Startup',
        phone: '9876501005',
        email: 'suresh@pgcrm.com',
        monthlyTarget: 0,
        status: 'Active',
    },
];

/** Given a preferredArea string (may be multi e.g. "Koramangala, BTM Layout"),
 *  return the best matching Sales employee, or null */
export function autoAssignEmployee(preferredArea: string | null): Employee | null {
    if (!preferredArea) return null;
    const areas = preferredArea.split(',').map(a => a.trim());
    for (const area of areas) {
        const emp = EMPLOYEES.find(
            e => e.role === 'sales' && e.status === 'Active' && e.assignedAreas.some(a => a.toLowerCase() === area.toLowerCase())
        );
        if (emp) return emp;
    }
    return null;
}

export function getEmployeeByName(name: string): Employee | undefined {
    return EMPLOYEES.find(e => e.name === name);
}

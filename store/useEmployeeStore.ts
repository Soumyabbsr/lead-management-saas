import { create } from 'zustand';
import { Employee } from '@/lib/employees';
import { AdminEvent, AdminEventType } from '@/types/admin';
import apiClient from '@/lib/apiClient';

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

function nowISO() {
    return new Date().toISOString();
}

interface EmployeeStore {
    employees: Employee[];
    activityLog: AdminEvent[];

    // Employee CRUD
    fetchEmployees: () => Promise<void>;
    addEmployee: (emp: Omit<Employee, 'id'>) => Promise<Employee>;
    updateEmployee: (id: string, patch: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    toggleStatus: (id: string) => Promise<void>;

    // Activity log
    logEvent: (evt: Omit<AdminEvent, 'id' | 'timestamp'>) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
    employees: [],
    activityLog: [],

    fetchEmployees: async () => {
        try {
            const res = await apiClient.get('/employees');
            if (res.data.success) {
                // Map mongo _id to id for the frontend
                const mapped = res.data.data.map((e: any) => ({
                    ...e,
                    id: e._id,
                    avatar: e.name.substring(0, 2).toUpperCase(),
                    plan: 'Startup'
                }));
                set({ employees: mapped });
            }
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    },

    addEmployee: async (emp) => {
        const res = await apiClient.post('/employees', emp);
        const savedEmp = res.data.data;
        const newEmp: Employee = {
            ...savedEmp,
            id: savedEmp._id,
            avatar: savedEmp.name.substring(0, 2).toUpperCase(),
            plan: 'Startup'
        };

        set(s => ({ employees: [...s.employees, newEmp] }));
        get().logEvent({
            type: 'employee_created',
            description: `Employee "${newEmp.name}" created with role ${newEmp.role}`,
            by: 'Admin',
            employeeId: newEmp.id,
            employeeName: newEmp.name,
        });
        return newEmp;
    },

    updateEmployee: async (id, patch) => {
        try {
            await apiClient.put(`/employees/${id}`, patch);
            set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, ...patch } : e) }));
            const emp = get().employees.find(e => e.id === id);
            get().logEvent({
                type: 'employee_updated',
                description: `Employee "${emp?.name}" updated`,
                by: 'Admin',
                employeeId: id,
                employeeName: emp?.name,
            });
        } catch (err) {
            console.error('Failed to update employee', err);
            throw err;
        }
    },

    deleteEmployee: async (id) => {
        const emp = get().employees.find(e => e.id === id);
        try {
            await apiClient.delete(`/employees/${id}`);
            set(s => ({ employees: s.employees.filter(e => e.id !== id) }));
            get().logEvent({
                type: 'employee_deleted',
                description: `Employee "${emp?.name}" deleted`,
                by: 'Admin',
                employeeId: id,
                employeeName: emp?.name,
            });
        } catch (err) {
            console.error('Failed to delete employee', err);
            throw err;
        }
    },

    toggleStatus: async (id) => {
        const emp = get().employees.find(e => e.id === id);
        try {
            const res = await apiClient.put(`/employees/${id}/status`, {});
            const newStatus = res.data.data.status;
            set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, status: newStatus } : e) }));
            get().logEvent({
                type: 'employee_updated',
                description: `Employee "${emp?.name}" set to ${newStatus}`,
                by: 'Admin',
                employeeId: id,
                employeeName: emp?.name,
            });
        } catch (err) {
            console.error('Failed to toggle status', err);
            throw err;
        }
    },

    logEvent: (evt) => {
        const event: AdminEvent = { ...evt, id: uid(), timestamp: nowISO() };
        set(s => ({ activityLog: [event, ...s.activityLog] }));
    },
}));

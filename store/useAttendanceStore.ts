import { create } from 'zustand';
import api from '@/lib/apiClient';

interface AttendanceRecord {
    _id: string;
    employee: any;
    tenantId: string;
    date: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
    latitude: number;
    longitude: number;
    selfieUrl: string;
    locationVerified: boolean;
    totalDurationMinutes: number;
    activeLogins: { in: string; out: string | null }[];
}

interface AttendanceState {
    todayRecord: AttendanceRecord | null;
    isLoading: boolean;
    error: string | null;
    fetchTodayStatus: () => Promise<void>;
    checkIn: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
    checkOut: () => Promise<{ success: boolean; message?: string }>;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
    todayRecord: null,
    isLoading: false,
    error: null,

    fetchTodayStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/attendance/today');
            const records = res.data.data;
            // For employees, the API returns only their own record(s)
            set({ todayRecord: records.length > 0 ? records[0] : null, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to fetch attendance', isLoading: false });
        }
    },

    checkIn: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/attendance/check-in', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            set({ todayRecord: res.data.data, isLoading: false });
            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Check-in failed';
            set({ error: msg, isLoading: false });
            return { success: false, message: msg };
        }
    },

    checkOut: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/attendance/check-out');
            set({ todayRecord: res.data.data, isLoading: false });
            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Check-out failed';
            set({ error: msg, isLoading: false });
            return { success: false, message: msg };
        }
    },
}));

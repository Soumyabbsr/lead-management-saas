import { create } from 'zustand';
import api from '@/lib/apiClient';

interface SettingsState {
    areas: string[];
    officeLocation: { latitude: number; longitude: number; radiusMeters: number };
    lateThresholdTime: string;
    isLoading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
    addArea: (area: string) => Promise<void>;
    removeArea: (area: string) => Promise<void>;
    updateOfficeLocation: (data: { officeLocation?: any; lateThresholdTime?: string }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    areas: [],
    officeLocation: { latitude: 0, longitude: 0, radiusMeters: 100 },
    lateThresholdTime: '10:00',
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/settings');
            const data = res.data.data;
            set({
                areas: data.operatingAreas || [],
                officeLocation: data.officeLocation || { latitude: 0, longitude: 0, radiusMeters: 100 },
                lateThresholdTime: data.lateThresholdTime || '10:00',
                isLoading: false,
            });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to fetch settings', isLoading: false });
        }
    },

    addArea: async (area: string) => {
        const currentAreas = get().areas;
        if (currentAreas.includes(area)) return;

        const newAreas = [...currentAreas, area];
        try {
            const res = await api.put('/settings', { operatingAreas: newAreas });
            set({ areas: res.data.data.operatingAreas });
        } catch (err: any) {
            console.error(err);
            set({ error: err.response?.data?.message || 'Failed to add area' });
        }
    },

    removeArea: async (area: string) => {
        const currentAreas = get().areas;
        const newAreas = currentAreas.filter(a => a !== area);

        try {
            const res = await api.put('/settings', { operatingAreas: newAreas });
            set({ areas: res.data.data.operatingAreas });
        } catch (err: any) {
            console.error(err);
            set({ error: err.response?.data?.message || 'Failed to remove area' });
        }
    },

    updateOfficeLocation: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put('/settings', data);
            const d = res.data.data;
            set({
                officeLocation: d.officeLocation || get().officeLocation,
                lateThresholdTime: d.lateThresholdTime || get().lateThresholdTime,
                isLoading: false,
            });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to update office location', isLoading: false });
        }
    },
}));

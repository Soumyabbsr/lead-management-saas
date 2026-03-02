import { create } from 'zustand';
import api from '@/lib/apiClient';

interface SettingsState {
    areas: string[];
    isLoading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
    addArea: (area: string) => Promise<void>;
    removeArea: (area: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    areas: [],
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/settings');
            set({ areas: res.data.data.operatingAreas || [], isLoading: false });
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
    }
}));

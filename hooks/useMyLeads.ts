'use client';

import { useMemo } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { useAuth } from '@/context/AuthContext';
import { Lead } from '@/types/lead';

/**
 * Returns only the leads assigned to the currently logged-in employee.
 * Admins see all leads.
 */
export function useMyLeads(): Lead[] {
    const leads = useLeadStore(s => s.leads);
    const { currentUser, isAdmin } = useAuth();

    return useMemo(
        () => {
            if (!currentUser) return [];
            return isAdmin ? leads : leads.filter(l => l.assignedTo === currentUser.name)
        },
        [leads, currentUser, isAdmin]
    );
}

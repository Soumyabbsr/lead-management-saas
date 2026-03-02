'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Super Admin Protected Route ensures that the user is logged in
 * AND has the super_admin role.
 */
export default function SuperAdminProtectedRoute({ children }: { children: React.ReactNode }) {
    const { currentUser, loading, isSuperAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                router.push('/super-admin/login');
            } else if (!isSuperAdmin) {
                // If they try to access /super-admin but aren't super admin
                router.push('/dashboard');
            }
        }
    }, [currentUser, loading, isSuperAdmin, router]);

    // Show nothing while checking auth session to prevent flashes
    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Verifying credentials...</div>
            </div>
        );
    }

    if (!currentUser || !isSuperAdmin) return null;

    return <>{children}</>;
}

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Protect routes ensures that the user is logged in.
 * If requireAdmin is true, it also ensures the user role is Admin.
 */
export default function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
    const { currentUser, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                router.push('/login');
            } else if (requireAdmin && !isAdmin) {
                // If they try to access /admin but aren't admin, kick them back to their dashboard
                router.push('/dashboard');
            }
        }
    }, [currentUser, loading, isAdmin, router, requireAdmin]);

    // Show nothing while checking auth session to prevent flashes
    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Loading session...</div>
            </div>
        );
    }

    if (!currentUser) return null;
    if (requireAdmin && !isAdmin) return null;

    return <>{children}</>;
}

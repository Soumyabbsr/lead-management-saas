'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute requireAdmin={true}>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', overflowX: 'hidden' }}>
                <AdminSidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
                    <AdminTopBar />
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}

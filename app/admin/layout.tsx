import AdminSidebar from '@/components/admin/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute requireAdmin={true}>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', overflowX: 'hidden' }}>
                <AdminSidebar />
                <div className="admin-mobile-pt" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}

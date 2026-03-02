'use client';

import './globals.css';
import Sidebar from '@/components/ui/Sidebar';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/context/SidebarContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/super-admin/login';
  const isAdminRoute = pathname?.startsWith('/admin');
  const isSuperAdminRoute = pathname?.startsWith('/super-admin') && !isLoginPage;

  return (
    <html lang="en">
      <head>
        <title>PG CRM — Sales Dashboard</title>
      </head>
      <body style={{ margin: 0, display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <AuthProvider>
          <ToastProvider>
            <SidebarProvider>
              {!isLoginPage && !isAdminRoute && !isSuperAdminRoute && <Sidebar />}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
                {isLoginPage || isSuperAdminRoute ? (
                  children
                ) : (
                  <ProtectedRoute>
                    {children}
                  </ProtectedRoute>
                )}
              </div>
            </SidebarProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

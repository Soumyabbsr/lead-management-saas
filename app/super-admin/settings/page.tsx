'use client';

import React from 'react';

export default function SettingsPage() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Platform Settings</h1>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Global configurations for the master PG CRM engine.</p>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '64px 32px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Global Configuration</h2>
                <p style={{ margin: '0 0 24px 0', color: '#64748b', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                    System logs, platform-wide branding updates, and admin user credentials can be managed from here in future updates.
                </p>
            </div>
        </div>
    );
}

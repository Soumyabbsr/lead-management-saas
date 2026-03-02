'use client';

import React from 'react';

export default function PlansPage() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Subscription Plans</h1>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Create and manage pricing tiers for your SaaS.</p>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '64px 32px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Billing Engine Coming Soon</h2>
                <p style={{ margin: '0 0 24px 0', color: '#64748b', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Currently, all tenants operate on custom limits manually assigned during creation. Automated plan tiers and Stripe/Payment Gateway integration will be active here soon.
                </p>
            </div>
        </div>
    );
}

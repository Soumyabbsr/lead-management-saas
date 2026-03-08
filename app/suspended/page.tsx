'use client';

import React from 'react';
import { ShieldAlert, Mail, Phone, ArrowLeft } from 'lucide-react';

export default function SuspendedPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: 20,
        }}>
            {/* Decorative background */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(ellipse at 30% 40%, rgba(239,68,68,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(245,158,11,0.08) 0%, transparent 50%)',
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%',
                maxWidth: 480,
                background: 'rgba(30, 41, 59, 0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                padding: '48px 40px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                border: '1px solid rgba(239,68,68,0.2)',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
            }}>
                {/* Icon */}
                <div style={{
                    width: 72, height: 72,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    borderRadius: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    boxShadow: '0 8px 24px rgba(239,68,68,0.35)',
                }}>
                    <ShieldAlert size={36} color="#fff" />
                </div>

                {/* Title */}
                <h1 style={{
                    margin: '0 0 8px 0',
                    fontSize: 26,
                    fontWeight: 800,
                    color: '#fca5a5',
                    letterSpacing: '-0.5px',
                }}>
                    Account Suspended
                </h1>

                <p style={{
                    margin: '0 0 32px 0',
                    color: '#94a3b8',
                    fontSize: 15,
                    lineHeight: 1.6,
                }}>
                    Your account has been temporarily suspended by the platform administrator.
                    You cannot access your dashboard or any services until your account is reactivated.
                </p>

                {/* Reason Card */}
                <div style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 14,
                    padding: '20px 24px',
                    marginBottom: 28,
                    textAlign: 'left',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Why was my account suspended?
                    </div>
                    <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
                        This could be due to payment issues, policy violations, or an administrative decision.
                        Please contact the PG Master team for details and to resolve this matter.
                    </div>
                </div>

                {/* Contact Info */}
                <div style={{
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    borderRadius: 14,
                    padding: '20px 24px',
                    marginBottom: 32,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#93c5fd', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Contact PG Master Team
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <a
                            href="mailto:support@pgcrm.com"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                color: '#e2e8f0', textDecoration: 'none', fontSize: 14, fontWeight: 500,
                                padding: '10px 14px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.04)',
                                transition: 'background 0.2s',
                            }}
                        >
                            <Mail size={18} color="#60a5fa" />
                            support@pgcrm.com
                        </a>
                        <a
                            href="tel:+919876543210"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                color: '#e2e8f0', textDecoration: 'none', fontSize: 14, fontWeight: 500,
                                padding: '10px 14px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.04)',
                                transition: 'background 0.2s',
                            }}
                        >
                            <Phone size={18} color="#60a5fa" />
                            +91 98765 43210
                        </a>
                    </div>
                </div>

                {/* Back to Login */}
                <a
                    href="/login"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#94a3b8',
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 500,
                        padding: '10px 20px',
                        borderRadius: 10,
                        border: '1px solid #334155',
                        transition: 'all 0.2s',
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Login
                </a>

                {/* Footer */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    marginTop: 32,
                    paddingTop: 20,
                }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                        🔒 If you believe this is an error, please reach out to the admin team immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}

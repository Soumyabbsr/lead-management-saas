'use client';

import Modal from './Modal';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open, title, message, confirmLabel = 'Confirm',
    cancelLabel = 'Cancel', danger = false, onConfirm, onCancel,
}: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onCancel} title={title} width={400}>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={onCancel} style={{
                    padding: '9px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                    background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#475569',
                }}>
                    {cancelLabel}
                </button>
                <button onClick={onConfirm} style={{
                    padding: '9px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                    background: danger ? '#ef4444' : '#2563eb',
                    border: 'none', cursor: 'pointer', color: '#fff',
                }}>
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}

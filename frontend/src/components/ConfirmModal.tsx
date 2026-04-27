interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger = true, onConfirm, onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
      onClick={onCancel}
    >
      <div
        style={{ backgroundColor: 'white', borderRadius: 12, padding: '28px 28px 24px', maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: "'Nunito','Segoe UI',sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0a1628', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', backgroundColor: danger ? '#dc2626' : '#1a56db', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
